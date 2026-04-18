"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDrag, useDrop } from "react-dnd";
import {
  ArrowLeft,
  ArrowRight,
  Filter,
  Flag,
  GripVertical,
  MessageSquareWarning,
  Pencil,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import clsx from "clsx";
import type { Lead, Stage } from "@/lib/types";

type KanbanBoardProps = {
  workspaceId: string;
  stages: Stage[];
  leads: Lead[];
};

type DragItem = {
  leadId: string;
  fromStageId: string;
};

const priorityLabel: Record<Lead["priority"], string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta"
};

const priorityStyles: Record<Lead["priority"], string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-rose-100 text-rose-700 border-rose-200"
};

const daysWithoutContact = (lead: Lead) => {
  const base = lead.lastContactAt ? new Date(lead.lastContactAt) : new Date(lead.createdAt);
  return Math.max(0, Math.floor((Date.now() - base.getTime()) / (1000 * 60 * 60 * 24)));
};

const getStageToneClass = (stageName: string) => {
  const normalized = stageName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("novo")) return "app-stage-tone-novo";
  if (normalized.includes("contato")) return "app-stage-tone-contato";
  if (normalized.includes("negocia")) return "app-stage-tone-negociacao";
  if (normalized.includes("ganho")) return "app-stage-tone-ganho";
  if (normalized.includes("perdido")) return "app-stage-tone-perdido";

  return "app-stage-tone-default";
};

const formatBudget = (value?: number) => {
  if (typeof value !== "number") {
    return "Sem orcamento";
  }

  return `R$ ${value.toLocaleString("pt-BR")}`;
};

const LeadCard = ({ lead }: { lead: Lead }) => {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: "lead",
      item: {
        leadId: lead.id,
        fromStageId: lead.stageId
      } as DragItem,
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    }),
    [lead.id, lead.stageId]
  );

  const inactiveDays = daysWithoutContact(lead);

  return (
    <article
      ref={(node) => {
        dragRef(node);
      }}
      className={clsx(
        "app-lead-card group flex min-h-[220px] flex-col justify-between gap-3 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5",
        { "scale-[0.985] opacity-65": isDragging }
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-[color:var(--text-primary)]">{lead.name}</p>
          <p className="truncate text-sm text-muted">{lead.company || "Sem empresa"}</p>
        </div>
        <GripVertical className="h-4 w-4 shrink-0 text-muted" aria-hidden />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={clsx("rounded-full border px-2.5 py-1 text-xs font-semibold", priorityStyles[lead.priority])}>
          <Flag className="mr-1 inline h-3 w-3" aria-hidden />
          {priorityLabel[lead.priority]}
        </span>

        {lead.hasPendingTask ? (
          <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
            <MessageSquareWarning className="mr-1 inline h-3 w-3" aria-hidden />
            Tarefa pendente
          </span>
        ) : null}
      </div>

      <div className="space-y-1 text-xs text-muted">
        <p>{lead.source || "Origem nao informada"}</p>
        <p>{formatBudget(lead.budget)}</p>
      </div>

      <div className="app-lead-meta rounded-xl px-3 py-2 text-xs text-muted">
        {inactiveDays} dia(s) sem contato
      </div>

      <div className="mt-auto flex items-center justify-end">
        <Link
          href={`/app/leads/${lead.id}`}
          className="text-sm font-medium text-[color:var(--accent-bright)] transition-colors hover:text-[color:var(--accent)] hover:underline"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  );
};

const StageColumn = ({
  stage,
  leads,
  stageToneClass,
  onDropLead,
  actions,
  children
}: {
  stage: Stage;
  leads: Lead[];
  stageToneClass: string;
  onDropLead: (item: DragItem, toStageId: string) => Promise<void>;
  actions: ReactNode;
  children: ReactNode;
}) => {
  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: "lead",
      drop: async (item: DragItem) => {
        await onDropLead(item, stage.id);
      },
      canDrop: (item: DragItem) => item.fromStageId !== stage.id,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      })
    }),
    [stage.id, onDropLead]
  );

  return (
    <section
      ref={(node) => {
        dropRef(node);
      }}
      className={clsx(
        "app-stage-column surface-card flex min-h-[540px] min-w-[300px] snap-start flex-col border-t-4 p-4",
        stageToneClass,
        isOver && canDrop ? "ring-2 ring-[color:var(--brand-ring)]" : ""
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--accent-bright)]">
            {stage.name}
          </h3>
          <span className="app-stage-count mt-2 inline-flex rounded-full px-2 py-1 text-xs text-muted">
            {leads.length} lead(s)
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1">{actions}</div>
      </header>

      <div className="flex flex-1 flex-col gap-3">{children}</div>
    </section>
  );
};

export const KanbanBoard = ({ workspaceId, stages, leads }: KanbanBoardProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [boardLeads, setBoardLeads] = useState(leads);
  const [boardStages, setBoardStages] = useState(stages);
  const [newStageName, setNewStageName] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Lead["priority"]>("all");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [scoreMin, setScoreMin] = useState("");
  const [noFollowUpDays, setNoFollowUpDays] = useState("");
  const [onlyPendingTask, setOnlyPendingTask] = useState(false);

  useEffect(() => {
    setBoardLeads(leads);
  }, [leads]);

  useEffect(() => {
    setBoardStages(stages);
  }, [stages]);

  const orderedStages = useMemo(
    () => boardStages.slice().sort((a, b) => a.order - b.order),
    [boardStages]
  );

  const visibleLeads = useMemo(() => {
    const minBudgetValue = budgetMin ? Number(budgetMin) : null;
    const maxBudgetValue = budgetMax ? Number(budgetMax) : null;
    const minScoreValue = scoreMin ? Number(scoreMin) : null;
    const noFollowUpDaysValue = noFollowUpDays ? Number(noFollowUpDays) : null;
    const normalizedSearch = search.trim().toLowerCase();

    return boardLeads.filter((lead) => {
      if (stageFilter !== "all" && lead.stageId !== stageFilter) {
        return false;
      }

      if (sourceFilter !== "all" && (lead.source || "") !== sourceFilter) {
        return false;
      }

      if (priorityFilter !== "all" && lead.priority !== priorityFilter) {
        return false;
      }

      if (typeof minBudgetValue === "number" && (lead.budget ?? 0) < minBudgetValue) {
        return false;
      }

      if (typeof maxBudgetValue === "number" && (lead.budget ?? 0) > maxBudgetValue) {
        return false;
      }

      if (typeof minScoreValue === "number" && lead.score < minScoreValue) {
        return false;
      }

      if (typeof noFollowUpDaysValue === "number" && daysWithoutContact(lead) < noFollowUpDaysValue) {
        return false;
      }

      if (onlyPendingTask && !lead.hasPendingTask) {
        return false;
      }

      if (normalizedSearch) {
        const haystack = `${lead.name} ${lead.phone} ${lead.company ?? ""}`.toLowerCase();
        if (!haystack.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [
    boardLeads,
    budgetMax,
    budgetMin,
    noFollowUpDays,
    onlyPendingTask,
    priorityFilter,
    scoreMin,
    search,
    sourceFilter,
    stageFilter
  ]);

  const visibleStages = useMemo(() => {
    if (stageFilter === "all") {
      return orderedStages;
    }

    return orderedStages.filter((stage) => stage.id === stageFilter);
  }, [orderedStages, stageFilter]);

  const sources = useMemo(() => {
    return Array.from(new Set(boardLeads.map((lead) => lead.source).filter(Boolean))) as string[];
  }, [boardLeads]);

  const stalledVisibleLeads = useMemo(
    () => visibleLeads.filter((lead) => daysWithoutContact(lead) >= 3).length,
    [visibleLeads]
  );

  const pendingTaskVisibleLeads = useMemo(
    () => visibleLeads.filter((lead) => lead.hasPendingTask).length,
    [visibleLeads]
  );

  const avgVisibleScore = useMemo(() => {
    if (visibleLeads.length === 0) {
      return 0;
    }

    const total = visibleLeads.reduce((acc, lead) => acc + lead.score, 0);
    return Math.round(total / visibleLeads.length);
  }, [visibleLeads]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    stageFilter !== "all" ||
    sourceFilter !== "all" ||
    priorityFilter !== "all" ||
    budgetMin.length > 0 ||
    budgetMax.length > 0 ||
    scoreMin.length > 0 ||
    noFollowUpDays.length > 0 ||
    onlyPendingTask;

  const refresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const moveLead = async (leadId: string, toStageId: string, fromStageId: string) => {
    if (toStageId === fromStageId) {
      return;
    }

    const previous = boardLeads;
    setBoardLeads((current) =>
      current.map((lead) => (lead.id === leadId ? { ...lead, stageId: toStageId } : lead))
    );

    try {
      const response = await fetch("/api/pipeline/stage-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          leadId,
          fromStageId,
          toStageId
        })
      });

      if (!response.ok) {
        throw new Error("stage move failed");
      }

      refresh();
    } catch {
      setBoardLeads(previous);
    }
  };

  const createStage = async () => {
    if (!newStageName.trim()) {
      return;
    }

    const response = await fetch("/api/pipeline/stages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        name: newStageName.trim()
      })
    });

    if (response.ok) {
      setNewStageName("");
      refresh();
    }
  };

  const rename = async (stage: Stage) => {
    const name = window.prompt("Novo nome do stage", stage.name);
    if (!name || name.trim().length < 2) {
      return;
    }

    const response = await fetch("/api/pipeline/stages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "rename",
        workspaceId,
        stageId: stage.id,
        name: name.trim()
      })
    });

    if (response.ok) {
      refresh();
    }
  };

  const reorder = async (stageId: string, direction: "left" | "right") => {
    const currentIndex = orderedStages.findIndex((stage) => stage.id === stageId);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedStages.length) {
      return;
    }

    const copy = [...orderedStages];
    const [stage] = copy.splice(currentIndex, 1);
    copy.splice(targetIndex, 0, stage);

    setBoardStages(copy.map((item, idx) => ({ ...item, order: idx })));

    const response = await fetch("/api/pipeline/stages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reorder",
        workspaceId,
        orderedIds: copy.map((item) => item.id)
      })
    });

    if (response.ok) {
      refresh();
    }
  };

  const remove = async (stage: Stage) => {
    if (stage.isSystem) {
      return;
    }

    if (!window.confirm("Remover stage e mover leads para o proximo disponivel?")) {
      return;
    }

    const response = await fetch("/api/pipeline/stages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, stageId: stage.id })
    });

    if (response.ok) {
      refresh();
    }
  };

  return (
    <section className="space-y-6">
      <div className="surface-card crm-fade-up-fast p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Pipeline</p>
            <h2 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">Kanban de vendas</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={clsx(
                "brand-button-secondary px-3 py-2",
                isFilterOpen && "border-[color:var(--border-accent)] text-[color:var(--text-accent)]"
              )}
              onClick={() => setIsFilterOpen((current) => !current)}
              aria-pressed={isFilterOpen}
            >
              <Filter className="h-4 w-4" aria-hidden />
              Filtros
            </button>
            <span className="brand-badge">{visibleLeads.length} leads visiveis</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Leads parados</p>
            <p className="mt-1 text-xl font-semibold text-[color:var(--text-primary)]">{stalledVisibleLeads}</p>
          </div>
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Tarefas pendentes</p>
            <p className="mt-1 text-xl font-semibold text-[color:var(--text-primary)]">{pendingTaskVisibleLeads}</p>
          </div>
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Score medio</p>
            <p className="mt-1 text-xl font-semibold text-[color:var(--text-primary)]">{avgVisibleScore}</p>
          </div>
          <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Stages visiveis</p>
            <p className="mt-1 text-xl font-semibold text-[color:var(--text-primary)]">{visibleStages.length}</p>
          </div>
        </div>

        {isFilterOpen && (
          <div className="mt-4 rounded-2xl border border-[color:var(--brand-border)] bg-white/65 p-3 sm:p-4">
            <div className="relative mb-3">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                className="brand-input pl-10"
                placeholder="Busca por nome, telefone ou empresa"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <select className="brand-input" value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
                <option value="all">Todos stages</option>
                {orderedStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>

              <select className="brand-input" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
                <option value="all">Todas fontes</option>
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>

              <select
                className="brand-input"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value as "all" | Lead["priority"])}
              >
                <option value="all">Todas prioridades</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baixa</option>
              </select>

              <label className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--brand-border)] bg-white/60 px-3 py-2 text-sm text-muted">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  checked={onlyPendingTask}
                  onChange={(event) => setOnlyPendingTask(event.target.checked)}
                />
                So com tarefa pendente
              </label>

              <input
                className="brand-input"
                type="number"
                min="0"
                placeholder="Orcamento min"
                value={budgetMin}
                onChange={(event) => setBudgetMin(event.target.value)}
              />
              <input
                className="brand-input"
                type="number"
                min="0"
                placeholder="Orcamento max"
                value={budgetMax}
                onChange={(event) => setBudgetMax(event.target.value)}
              />
              <input
                className="brand-input"
                type="number"
                min="0"
                placeholder="Score min"
                value={scoreMin}
                onChange={(event) => setScoreMin(event.target.value)}
              />
              <input
                className="brand-input"
                type="number"
                min="0"
                placeholder="Sem follow-up ha X dias"
                value={noFollowUpDays}
                onChange={(event) => setNoFollowUpDays(event.target.value)}
              />
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {hasActiveFilters ? "Filtros aplicados no funil." : "Nenhum filtro ativo."}
              </p>
              <button
                type="button"
                className="brand-button-secondary w-full justify-center px-3 py-2 sm:w-auto"
                onClick={() => {
                  setSearch("");
                  setStageFilter("all");
                  setSourceFilter("all");
                  setPriorityFilter("all");
                  setBudgetMin("");
                  setBudgetMax("");
                  setScoreMin("");
                  setNoFollowUpDays("");
                  setOnlyPendingTask(false);
                }}
                disabled={!hasActiveFilters}
              >
                <X className="h-4 w-4" aria-hidden />
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="surface-card crm-fade-up-fast crm-delay-fast-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Configuracao</p>
            <h2 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">Gestao de stages</h2>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            className="brand-input w-full sm:max-w-sm"
            placeholder="Novo stage"
            value={newStageName}
            onChange={(event) => setNewStageName(event.target.value)}
          />
          <button type="button" className="brand-button w-full justify-center sm:w-auto" onClick={createStage}>
            <Plus className="h-4 w-4" aria-hidden />
            Adicionar stage
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {visibleStages.map((stage, index) => {
          const stageLeads = visibleLeads.filter((lead) => lead.stageId === stage.id);
          const hasHiddenLeads =
            boardLeads.some((lead) => lead.stageId === stage.id) && stageLeads.length === 0;
          const stageToneClass = getStageToneClass(stage.name);
          const canMoveLeft = index > 0;
          const canMoveRight = index < visibleStages.length - 1;

          return (
            <div
              key={stage.id}
              className="crm-fade-up-fast space-y-2"
              style={{ animationDelay: `${Math.min(index * 28, 148)}ms` }}
            >
              <StageColumn
                stage={stage}
                leads={stageLeads}
                stageToneClass={stageToneClass}
                onDropLead={(item, toStageId) => moveLead(item.leadId, toStageId, item.fromStageId)}
                actions={
                  <>
                    <button
                      type="button"
                      className="brand-button-secondary px-2 py-1.5"
                      onClick={() => rename(stage)}
                      aria-label={`Renomear stage ${stage.name}`}
                      title="Renomear"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="brand-button-secondary px-2 py-1.5"
                      onClick={() => reorder(stage.id, "left")}
                      aria-label={`Mover stage ${stage.name} para esquerda`}
                      title="Mover para esquerda"
                      disabled={!canMoveLeft}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="brand-button-secondary px-2 py-1.5"
                      onClick={() => reorder(stage.id, "right")}
                      aria-label={`Mover stage ${stage.name} para direita`}
                      title="Mover para direita"
                      disabled={!canMoveRight}
                    >
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    {!stage.isSystem ? (
                      <button
                        type="button"
                        className="brand-button-secondary px-2 py-1.5"
                        onClick={() => remove(stage)}
                        aria-label={`Remover stage ${stage.name}`}
                        title="Remover stage"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    ) : null}
                  </>
                }
              >
                {stageLeads.length === 0 ? (
                  <div className="app-dropzone flex h-full min-h-32 items-center justify-center rounded-xl border border-dashed border-[color:var(--brand-border)] p-3 text-center text-sm text-muted">
                    {hasHiddenLeads ? "Nenhum lead corresponde aos filtros" : "Solte leads aqui"}
                  </div>
                ) : (
                  stageLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
                )}
              </StageColumn>
            </div>
          );
        })}
      </div>

      {isPending ? <p className="text-sm text-muted">Sincronizando mudancas...</p> : null}
    </section>
  );
};
