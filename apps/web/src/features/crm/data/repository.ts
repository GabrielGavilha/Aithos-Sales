import "server-only";

import { cache } from "react";
import {
  getLeadWithTimeline,
  getPipelineData,
  getWorkspaceById,
  getWorkspaceForms,
  listLeadTasks,
  listLeads,
  listStages
} from "@aithos/db";
import type { Lead as LegacyLead, Stage as LegacyStage } from "@aithos/db";
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

// Deduplica chamadas ao banco dentro do mesmo request (React cache por argumento)
const cachedListLeads = cache(listLeads);
const cachedListStages = cache(listStages);
const cachedListLeadTasks = cache(listLeadTasks);

// Métricas calculadas a partir dos dados já buscados — sem roundtrip extra
const computeMetrics = (leads: LegacyLead[], stages: LegacyStage[]) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const leadsToday = leads.filter((l) => {
    const d = new Date(l.createdAt);
    return d >= todayStart && d <= todayEnd;
  }).length;

  const contactHours = leads
    .filter((l) => l.lastContactAt)
    .map((l) => (new Date(l.lastContactAt as string).getTime() - new Date(l.createdAt).getTime()) / 3_600_000)
    .filter((h) => h >= 0);
  const avgTimeToFirstContactHours =
    contactHours.length > 0 ? contactHours.reduce((s, v) => s + v, 0) / contactHours.length : 0;

  const novoStage = stages.find((s) => s.name.toLowerCase() === "novo") ?? stages[0];
  const ganhoStage = stages.find((s) => s.name.toLowerCase() === "ganho") ?? stages[stages.length - 1];
  const totalNovo = leads.filter((l) => l.stageId === novoStage?.id).length;
  const totalGanho = leads.filter((l) => l.stageId === ganhoStage?.id).length;
  const conversionNovoToGanho = totalNovo > 0 ? (totalGanho / totalNovo) * 100 : 0;

  const stalledLeads = leads.filter((l) => {
    const pivot = l.lastContactAt ? new Date(l.lastContactAt) : new Date(l.createdAt);
    return Date.now() - pivot.getTime() > 86_400_000 * 3;
  }).length;

  const lossMap = new Map<string, number>();
  leads
    .filter((l) => l.status === "lost" && l.closedReason)
    .forEach((l) => lossMap.set(l.closedReason!, (lossMap.get(l.closedReason!) ?? 0) + 1));
  const topLossReasons = [...lossMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reason, total]) => ({ reason, total }));

  const leadsByStage = stages.map((s) => ({
    stageId: s.id,
    stageName: s.name,
    total: leads.filter((l) => l.stageId === s.id).length
  }));

  const conversionByStage = leadsByStage.map((entry, index) => {
    if (index === 0) return { stageName: entry.stageName, conversion: 100 };
    const prev = leadsByStage[index - 1];
    const conversion = prev.total > 0 ? Number(((entry.total / prev.total) * 100).toFixed(1)) : 0;
    return { stageName: `${prev.stageName} > ${entry.stageName}`, conversion };
  });

  return { leadsToday, avgTimeToFirstContactHours, conversionNovoToGanho, stalledLeads, topLossReasons, leadsByStage, conversionByStage };
};

const buildLeadsPayload = async (workspaceId: string): Promise<LeadsPayload> => {
  const [legacyLeads, legacyStages] = await Promise.all([
    cachedListLeads(workspaceId),
    cachedListStages(workspaceId)
  ]);
  const leads = legacyLeads.map(mapLegacyLead);
  const stages = legacyStages.map(mapLegacyStage);
  const sources = Array.from(new Set(leads.map((lead) => lead.source).filter(Boolean))) as string[];
  const tags = Array.from(new Set(leads.flatMap((lead) => lead.tags.map((tag) => tag.label)))).map((label) => ({
    id: label.toLowerCase().replace(/\s+/g, "-"),
    label
  }));

  return { leads, stages, sources, tags };
};

export const getLeadsPayload = async (workspaceId: string) => buildLeadsPayload(workspaceId);

export const getPipelinePayload = async (workspaceId: string): Promise<PipelinePayload> => {
  const pipeline = await getPipelineData(workspaceId);
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

  return { stages, columns };
};

export const getLeadDetailsPayload = async (
  workspaceId: string,
  leadId: string
): Promise<LeadDetailsPayload | null> => {
  const result = await getLeadWithTimeline(workspaceId, leadId);
  if (!result.lead) return null;

  const stages = (await cachedListStages(workspaceId)).map(mapLegacyStage);
  return {
    lead: mapLegacyLead(result.lead),
    tasks: result.tasks.map(mapLegacyTask),
    events: result.events.map(mapLegacyEvent),
    stages
  };
};

export const getTasksPayload = async (workspaceId: string): Promise<TasksPayload> => {
  const legacyLeads = await cachedListLeads(workspaceId);
  const tasksByLead = await Promise.all(legacyLeads.map((lead) => cachedListLeadTasks(workspaceId, lead.id)));
  const tasks = tasksByLead.flat().map(mapLegacyTask);

  return { tasks, leads: legacyLeads.map(mapLegacyLead) };
};

export const getDashboardPayload = async (workspaceId: string): Promise<DashboardPayload> => {
  // Uma única busca — cachedListLeads/Stages são reutilizados pelas outras funções no mesmo request
  const [legacyLeads, legacyStages] = await Promise.all([
    cachedListLeads(workspaceId),
    cachedListStages(workspaceId)
  ]);

  const metrics = computeMetrics(legacyLeads, legacyStages);
  const leads = legacyLeads.map(mapLegacyLead);

  // Tarefas em paralelo com os dados de leads já resolvidos
  const tasksByLead = await Promise.all(legacyLeads.map((l) => cachedListLeadTasks(workspaceId, l.id)));
  const allTasks = tasksByLead.flat().map(mapLegacyTask);

  const overdueTasks = allTasks.filter(
    (task) => task.status === "pending" && new Date(task.dueAt).getTime() < Date.now()
  );
  const leadsWithoutFollowUp = leads.filter((lead) => {
    const reference = lead.lastInteractionAt ?? lead.createdAt;
    return Date.now() - new Date(reference).getTime() > 86_400_000 * 3 && lead.status === "open";
  });

  return {
    metrics: [
      { id: "leads-today", label: "Leads capturados hoje", value: String(metrics.leadsToday), helper: "Entrada no dia atual" },
      { id: "first-contact", label: "Tempo medio ate 1o contato", value: `${metrics.avgTimeToFirstContactHours.toFixed(1)}h`, helper: "Media no periodo" },
      { id: "conversion-rate", label: "Taxa de conversao", value: `${metrics.conversionNovoToGanho.toFixed(1)}%`, helper: "Novo para ganho" },
      { id: "stalled", label: "Leads parados", value: String(metrics.stalledLeads), helper: "Sem follow-up ha 3+ dias" }
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
    conversionByStage: metrics.conversionByStage
  };
};

export const getFormsPayload = async (
  workspaceId: string,
  workspaceSlug: string
): Promise<FormsPayload> => {
  const forms = await getWorkspaceForms(workspaceId);
  return { forms: forms.map((form) => mapLegacyForm(form, workspaceSlug)) };
};

export const getMetricsPayload = async (workspaceId: string): Promise<MetricsPayload> => {
  const [legacyLeads, legacyStages] = await Promise.all([
    cachedListLeads(workspaceId),
    cachedListStages(workspaceId)
  ]);

  const leads = legacyLeads.map(mapLegacyLead);
  const stages = legacyStages.map(mapLegacyStage);
  const { avgTimeToFirstContactHours, topLossReasons } = computeMetrics(legacyLeads, legacyStages);

  const leadsBySourceMap = new Map<string, number>();
  const gainsVsLosses = [
    { period: "Sem 1", ganhos: 0, perdidos: 0 },
    { period: "Sem 2", ganhos: 0, perdidos: 0 },
    { period: "Sem 3", ganhos: 0, perdidos: 0 },
    { period: "Sem 4", ganhos: 0, perdidos: 0 }
  ];

  leads.forEach((lead, index) => {
    const source = lead.source ?? "indefinido";
    leadsBySourceMap.set(source, (leadsBySourceMap.get(source) ?? 0) + 1);
    const bucket = index % 4;
    if (lead.status === "won") gainsVsLosses[bucket].ganhos += 1;
    if (lead.status === "lost") gainsVsLosses[bucket].perdidos += 1;
  });

  const conversionByStage = stages
    .sort((a, b) => a.order - b.order)
    .map((stage, index) => {
      const stageTotal = leads.filter((lead) => lead.stageId === stage.id).length;
      if (index === 0) return { stageName: stage.name, conversion: 100 };
      const prevStage = stages[index - 1];
      const prevTotal = leads.filter((lead) => lead.stageId === prevStage.id).length;
      return {
        stageName: stage.name,
        conversion: prevTotal > 0 ? Number(((stageTotal / prevTotal) * 100).toFixed(1)) : 0
      };
    });

  const totalLoss = topLossReasons.reduce((sum, item) => sum + item.total, 0) || 1;
  const lossReasons = topLossReasons.map((item) => ({
    id: item.reason.toLowerCase().replace(/\s+/g, "-"),
    reason: item.reason,
    total: item.total,
    percentage: Number(((item.total / totalLoss) * 100).toFixed(1))
  }));

  return {
    lossReasons,
    conversionByStage,
    leadsBySource: Array.from(leadsBySourceMap.entries()).map(([source, total]) => ({ source, total })),
    gainsVsLosses,
    avgFirstContactHours: avgTimeToFirstContactHours
  };
};

export const getSettingsPayload = async (workspaceId: string): Promise<SettingsPayload> => {
  const [stages, leadsPayload, metricsPayload, workspace] = await Promise.all([
    cachedListStages(workspaceId),
    buildLeadsPayload(workspaceId),
    getMetricsPayload(workspaceId),
    getWorkspaceById(workspaceId)
  ]);

  const tagMap = new Map<string, string>();
  leadsPayload.leads.forEach((lead) => {
    lead.tags.forEach((tag) => tagMap.set(tag.id, tag.label));
  });

  return {
    stages: stages.map(mapLegacyStage),
    tags: Array.from(tagMap.entries()).map(([id, label]) => ({ id, label })),
    lossReasons: metricsPayload.lossReasons,
    followUpDays: workspace?.alertInactiveDays ?? 3,
    branding: {
      appName: "Aithos Sales",
      accentColor: "#2563eb"
    }
  };
};
