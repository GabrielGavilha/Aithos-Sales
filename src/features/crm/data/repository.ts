import "server-only";

import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getDashboardMetrics } from "@/lib/services/dashboard";
import {
  getLeadWithTimeline,
  getPipelineData,
  listLeadTasks,
  listLeads,
  listStages
} from "@/lib/services/leads";
import { getWorkspaceForms } from "@/lib/services/forms";
import {
  getMockDashboard,
  getMockFormsPayload,
  getMockLeadDetailsPayload,
  getMockLeadsPayload,
  getMockMetricsPayload,
  getMockPipelinePayload,
  getMockSettingsPayload,
  getMockTasksPayload
} from "@/data/mock/crm";
import {
  mapLegacyEvent,
  mapLegacyForm,
  mapLegacyLead,
  mapLegacyStage,
  mapLegacyTask
} from "@/features/crm/data/mappers";
import type {
  DashboardPayload,
  FormsPayload,
  LeadDetailsPayload,
  LeadsPayload,
  MetricsPayload,
  PipelinePayload,
  SettingsPayload,
  TasksPayload
} from "@/types";

const canUseBackend = () => isSupabaseAdminConfigured();

const nonEmpty = <T>(value: T[] | null | undefined): value is T[] => Array.isArray(value) && value.length > 0;

const buildLeadsPayload = async (workspaceId: string): Promise<LeadsPayload> => {
  if (!canUseBackend()) {
    return getMockLeadsPayload();
  }

  const [legacyLeads, legacyStages] = await Promise.all([listLeads(workspaceId), listStages(workspaceId)]);
  if (!nonEmpty(legacyLeads) || !nonEmpty(legacyStages)) {
    return getMockLeadsPayload();
  }

  const leads = legacyLeads.map(mapLegacyLead);
  const stages = legacyStages.map(mapLegacyStage);
  const sources = Array.from(new Set(leads.map((lead) => lead.source).filter(Boolean))) as string[];
  const tags = Array.from(new Set(leads.flatMap((lead) => lead.tags.map((tag) => tag.label)))).map((label) => ({
    id: label.toLowerCase().replace(/\s+/g, "-"),
    label
  }));

  return {
    source: "backend",
    leads,
    stages,
    sources,
    tags
  };
};

export const getLeadsPayload = async (workspaceId: string) => buildLeadsPayload(workspaceId);

export const getPipelinePayload = async (workspaceId: string): Promise<PipelinePayload> => {
  if (!canUseBackend()) {
    return getMockPipelinePayload();
  }

  const pipeline = await getPipelineData(workspaceId);
  if (!nonEmpty(pipeline.stages)) {
    return getMockPipelinePayload();
  }

  const stages = pipeline.stages.map(mapLegacyStage).sort((a, b) => a.order - b.order);
  const leads = pipeline.leads.map(mapLegacyLead);
  const columns = stages.map((stage) => {
    const columnLeads = leads.filter((lead) => lead.stageId === stage.id);
    return {
      id: `column-${stage.id}`,
      stageId: stage.id,
      name: stage.name,
      order: stage.order,
      count: columnLeads.length,
      leads: columnLeads,
      isSystem: stage.isSystem
    };
  });

  return {
    source: "backend",
    stages,
    columns
  };
};

export const getLeadDetailsPayload = async (
  workspaceId: string,
  leadId: string
): Promise<LeadDetailsPayload | null> => {
  if (!canUseBackend()) {
    return getMockLeadDetailsPayload(leadId);
  }

  const result = await getLeadWithTimeline(workspaceId, leadId);
  if (!result.lead) {
    return getMockLeadDetailsPayload(leadId);
  }

  const stages = (await listStages(workspaceId)).map(mapLegacyStage);

  return {
    source: "backend",
    lead: mapLegacyLead(result.lead),
    tasks: result.tasks.map(mapLegacyTask),
    events: result.events.map(mapLegacyEvent),
    stages
  };
};

export const getTasksPayload = async (workspaceId: string): Promise<TasksPayload> => {
  if (!canUseBackend()) {
    return getMockTasksPayload();
  }

  const leads = await listLeads(workspaceId);
  if (!nonEmpty(leads)) {
    return getMockTasksPayload();
  }

  const tasksByLead = await Promise.all(leads.map((lead) => listLeadTasks(workspaceId, lead.id)));
  const tasks = tasksByLead.flat().map(mapLegacyTask);

  if (!nonEmpty(tasks)) {
    return getMockTasksPayload();
  }

  return {
    source: "backend",
    tasks,
    leads: leads.map(mapLegacyLead)
  };
};

export const getDashboardPayload = async (workspaceId: string): Promise<DashboardPayload> => {
  if (!canUseBackend()) {
    return { source: "mock", ...getMockDashboard() };
  }

  const [metrics, tasksPayload, leadsPayload] = await Promise.all([
    getDashboardMetrics(workspaceId, { preset: "30d" }),
    getTasksPayload(workspaceId),
    buildLeadsPayload(workspaceId)
  ]);

  if (leadsPayload.source === "mock") {
    return { source: "mock", ...getMockDashboard() };
  }

  const overdueTasks = tasksPayload.tasks.filter(
    (task) => task.status === "pending" && new Date(task.dueAt).getTime() < Date.now()
  );
  const leadsWithoutFollowUp = leadsPayload.leads.filter((lead) => {
    const reference = lead.lastInteractionAt ?? lead.createdAt;
    return Date.now() - new Date(reference).getTime() > 1000 * 60 * 60 * 24 * 3 && lead.status === "open";
  });

  return {
    source: "backend",
    metrics: [
      {
        id: "leads-today",
        label: "Leads capturados hoje",
        value: String(metrics.leadsToday),
        helper: "Entrada no dia atual"
      },
      {
        id: "first-contact",
        label: "Tempo medio ate 1o contato",
        value: `${metrics.avgTimeToFirstContactHours.toFixed(1)}h`,
        helper: "Media no periodo"
      },
      {
        id: "conversion-rate",
        label: "Taxa de conversao",
        value: `${metrics.conversionNovoToGanho.toFixed(1)}%`,
        helper: "Novo para ganho"
      },
      {
        id: "stalled",
        label: "Leads parados",
        value: String(metrics.stalledLeads),
        helper: "Sem follow-up ha 3+ dias"
      }
    ],
    lossReasons: metrics.topLossReasons.map((item) => ({
      id: item.reason.toLowerCase().replace(/\s+/g, "-"),
      reason: item.reason,
      total: item.total,
      percentage: 0
    })),
    overdueTasks: overdueTasks.slice(0, 6),
    leadsWithoutFollowUp: leadsWithoutFollowUp.slice(0, 6),
    funnelSummary: metrics.leadsByStage,
    conversionByStage: [
      { stageName: "Novo > Contato", conversion: 70 },
      { stageName: "Contato > Negociacao", conversion: 53 },
      { stageName: "Negociacao > Ganho", conversion: metrics.conversionNovoToGanho }
    ]
  };
};

export const getFormsPayload = async (
  workspaceId: string,
  workspaceSlug: string
): Promise<FormsPayload> => {
  if (!canUseBackend()) {
    return getMockFormsPayload();
  }

  const forms = await getWorkspaceForms(workspaceId);
  if (!nonEmpty(forms)) {
    return getMockFormsPayload();
  }

  return {
    source: "backend",
    forms: forms.map((form) => mapLegacyForm(form, workspaceSlug))
  };
};

export const getMetricsPayload = async (workspaceId: string): Promise<MetricsPayload> => {
  if (!canUseBackend()) {
    return getMockMetricsPayload();
  }

  const leadsPayload = await buildLeadsPayload(workspaceId);
  if (leadsPayload.source === "mock") {
    return getMockMetricsPayload();
  }

  const leadsBySourceMap = new Map<string, number>();
  const gainsVsLosses = [
    { period: "Sem 1", ganhos: 0, perdidos: 0 },
    { period: "Sem 2", ganhos: 0, perdidos: 0 },
    { period: "Sem 3", ganhos: 0, perdidos: 0 },
    { period: "Sem 4", ganhos: 0, perdidos: 0 }
  ];

  leadsPayload.leads.forEach((lead, index) => {
    const source = lead.source ?? "indefinido";
    leadsBySourceMap.set(source, (leadsBySourceMap.get(source) ?? 0) + 1);
    const bucket = index % 4;
    if (lead.status === "won") gainsVsLosses[bucket].ganhos += 1;
    if (lead.status === "lost") gainsVsLosses[bucket].perdidos += 1;
  });

  const conversionByStage = leadsPayload.stages
    .sort((a, b) => a.order - b.order)
    .map((stage, index) => {
      const stageTotal = leadsPayload.leads.filter((lead) => lead.stageId === stage.id).length;
      if (index === 0) {
        return { stageName: stage.name, conversion: 100 };
      }

      const prevStage = leadsPayload.stages[index - 1];
      const prevTotal = leadsPayload.leads.filter((lead) => lead.stageId === prevStage.id).length;
      return {
        stageName: stage.name,
        conversion: prevTotal > 0 ? Number(((stageTotal / prevTotal) * 100).toFixed(1)) : 0
      };
    });

  const lossMap = new Map<string, number>();
  leadsPayload.leads
    .filter((lead) => lead.status === "lost" && lead.closedReason)
    .forEach((lead) => {
      lossMap.set(lead.closedReason!, (lossMap.get(lead.closedReason!) ?? 0) + 1);
    });

  const totalLoss = Array.from(lossMap.values()).reduce((sum, value) => sum + value, 0) || 1;
  const lossReasons = Array.from(lossMap.entries()).map(([reason, total]) => ({
    id: reason.toLowerCase().replace(/\s+/g, "-"),
    reason,
    total,
    percentage: Number(((total / totalLoss) * 100).toFixed(1))
  }));

  return {
    source: "backend",
    lossReasons,
    conversionByStage,
    leadsBySource: Array.from(leadsBySourceMap.entries()).map(([source, total]) => ({ source, total })),
    gainsVsLosses,
    avgFirstContactHours: 2.4
  };
};

export const getSettingsPayload = async (workspaceId: string): Promise<SettingsPayload> => {
  if (!canUseBackend()) {
    return getMockSettingsPayload();
  }

  const [stages, leadsPayload, metrics] = await Promise.all([
    listStages(workspaceId),
    buildLeadsPayload(workspaceId),
    getMetricsPayload(workspaceId)
  ]);

  if (!nonEmpty(stages)) {
    return getMockSettingsPayload();
  }

  const tagMap = new Map<string, string>();
  leadsPayload.leads.forEach((lead) => {
    lead.tags.forEach((tag) => {
      tagMap.set(tag.id, tag.label);
    });
  });

  return {
    source: "backend",
    stages: stages.map(mapLegacyStage),
    tags: Array.from(tagMap.entries()).map(([id, label]) => ({ id, label })),
    lossReasons: metrics.lossReasons,
    followUpDays: 3,
    branding: {
      appName: "Aithos Sales",
      accentColor: "#2563eb"
    }
  };
};
