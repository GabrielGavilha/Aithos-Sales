import type { DragEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Plus, Search, X } from "lucide-react";
import clsx from "clsx";
import { COLUMN_CONFIG, sampleCards, STATUS_ORDER } from "../data/sampleKanban";
import { useKanban } from "../hooks/useKanban";
import type { SaleCard as KanbanCardType, Status } from "../types/kanban";
import { SaleCard } from "./SaleCard";

const priorityOptions: Array<{ value: "all" | KanbanCardType["prioridade"]; label: string }> = [
  { value: "all", label: "Todas as prioridades" },
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

const originOptions: Array<{ value: "all" | KanbanCardType["origem"]; label: string }> = [
  { value: "all", label: "Todas as origens" },
  { value: "instagram", label: "Instagram" },
  { value: "site", label: "Site" },
  { value: "trafego-pago", label: "Trafego Pago" },
  { value: "qr-code", label: "QR Code" },
  { value: "indicacao", label: "Indicacao" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "organico", label: "Organico" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "email", label: "E-mail" },
];

type CreateLeadForm = {
  nome: string;
  empresa: string;
  orcamento: string;
  prioridade: KanbanCardType["prioridade"];
  etapa: Status;
  origem: KanbanCardType["origem"];
  tags: string;
  vendedorNome: string;
  proximoFollowupEm: string;
};

const getTodayInputValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const createDefaultForm = (etapa: Status = "novo"): CreateLeadForm => ({
  nome: "",
  empresa: "",
  orcamento: "",
  prioridade: "media",
  etapa,
  origem: "whatsapp",
  tags: "",
  vendedorNome: "",
  proximoFollowupEm: getTodayInputValue(),
});

const getInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "AA";
};

const createEmptyColumns = (): Record<Status, KanbanCardType[]> =>
  STATUS_ORDER.reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {} as Record<Status, KanbanCardType[]>);

export const KanbanBoard = () => {
  const {
    columns: columnData,
    activeCardId,
    overColumnId,
    handleDragStart,
    handleDragEnd,
    handleDragOverColumn,
    handleDrop,
    moveRelative,
    addCard,
  } = useKanban(sampleCards);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | KanbanCardType["prioridade"]>(
    "all"
  );
  const [originFilter, setOriginFilter] = useState<"all" | KanbanCardType["origem"]>("all");
  const [stageFilter, setStageFilter] = useState<"all" | Status>("all");
  const [showOnlyStuck, setShowOnlyStuck] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateLeadForm>(() => createDefaultForm());

  const visibleColumnData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return STATUS_ORDER.reduce((acc, stage) => {
      acc[stage] = columnData[stage].filter((card) => {
        const matchesPriority = priorityFilter === "all" || card.prioridade === priorityFilter;
        const matchesOrigin = originFilter === "all" || card.origem === originFilter;
        const matchesStage = stageFilter === "all" || card.etapa === stageFilter;
        const matchesStuck = !showOnlyStuck || card.diasParado >= 3;
        const matchesSearch =
          !normalizedSearch ||
          `${card.nome} ${card.empresa ?? ""} ${card.vendedor.name} ${card.tags.join(" ")} ${card.origem}`
            .toLowerCase()
            .includes(normalizedSearch);

        return matchesPriority && matchesOrigin && matchesStage && matchesStuck && matchesSearch;
      });

      return acc;
    }, createEmptyColumns());
  }, [columnData, originFilter, priorityFilter, searchTerm, showOnlyStuck, stageFilter]);

  const visibleColumns = useMemo(() => {
    if (stageFilter === "all") {
      return COLUMN_CONFIG;
    }

    return COLUMN_CONFIG.filter((column) => column.id === stageFilter);
  }, [stageFilter]);

  const totalVisibleLeads = useMemo(
    () =>
      visibleColumns.reduce((count, column) => count + visibleColumnData[column.id].length, 0),
    [visibleColumnData, visibleColumns]
  );

  const stuckVisibleLeads = useMemo(
    () =>
      visibleColumns.reduce(
        (count, column) =>
          count + visibleColumnData[column.id].filter((card) => card.diasParado >= 3).length,
        0
      ),
    [visibleColumnData, visibleColumns]
  );

  const overdueFollowups = useMemo(
    () =>
      visibleColumns.reduce(
        (count, column) =>
          count +
          visibleColumnData[column.id].filter(
            (card) =>
              card.proximoFollowupEm && new Date(card.proximoFollowupEm).getTime() < Date.now()
          ).length,
        0
      ),
    [visibleColumnData, visibleColumns]
  );

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    priorityFilter !== "all" ||
    originFilter !== "all" ||
    stageFilter !== "all" ||
    showOnlyStuck;

  const openCreateModal = (status: Status) => {
    setCreateForm(createDefaultForm(status));
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, status: Status) => {
    event.preventDefault();
    handleDragOverColumn(status);
  };

  const handleDropOnColumn = (event: DragEvent<HTMLDivElement>, status: Status) => {
    event.preventDefault();
    const cardId = event.dataTransfer.getData("text/plain");
    if (cardId) {
      handleDrop(cardId, status);
    }
  };

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedBudget = createForm.orcamento.trim()
      ? Number(createForm.orcamento.replace(/\./g, "").replace(",", "."))
      : undefined;

    if (
      !createForm.nome.trim() ||
      !createForm.vendedorNome.trim() ||
      (typeof parsedBudget === "number" && (Number.isNaN(parsedBudget) || parsedBudget <= 0))
    ) {
      return;
    }

    addCard({
      id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nome: createForm.nome.trim(),
      empresa: createForm.empresa.trim() || undefined,
      orcamento: parsedBudget,
      prioridade: createForm.prioridade,
      etapa: createForm.etapa,
      origem: createForm.origem,
      tags: createForm.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
      ultimoContatoEm: getTodayInputValue(),
      proximoFollowupEm: createForm.proximoFollowupEm || undefined,
      diasParado: 0,
      vendedor: {
        name: createForm.vendedorNome.trim(),
        initials: getInitials(createForm.vendedorNome),
      },
    });

    closeCreateModal();
  };

  return (
    <section className="flex h-full w-full flex-col">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Funil CRM</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Kanban comercial refatorado</h2>
          <p className="mt-2 text-sm text-slate-500">
            Organize leads por etapa com filtros de prioridade, origem e follow-up.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition",
              isFilterOpen
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
            onClick={() => setIsFilterOpen((current) => !current)}
            aria-pressed={isFilterOpen}
          >
            <Filter className="h-4 w-4" aria-hidden />
            Filtrar
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            onClick={() => openCreateModal("novo")}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Novo Lead
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Leads visiveis</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalVisibleLeads}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Leads parados</p>
          <p className="mt-1 text-2xl font-semibold text-orange-600">{stuckVisibleLeads}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Follow-up atrasado</p>
          <p className="mt-1 text-2xl font-semibold text-rose-600">{overdueFollowups}</p>
        </div>
      </div>

      {isFilterOpen && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                Busca
              </span>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  className="brand-input pl-10"
                  placeholder="Lead, vendedor, tag ou origem"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                Prioridade
              </span>
              <select
                className="brand-input"
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value as "all" | KanbanCardType["prioridade"])
                }
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                Origem
              </span>
              <select
                className="brand-input"
                value={originFilter}
                onChange={(event) =>
                  setOriginFilter(event.target.value as "all" | KanbanCardType["origem"])
                }
              >
                {originOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                Etapa
              </span>
              <select
                className="brand-input"
                value={stageFilter}
                onChange={(event) => setStageFilter(event.target.value as "all" | Status)}
              >
                <option value="all">Todas as etapas</option>
                {COLUMN_CONFIG.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={showOnlyStuck}
              onChange={(event) => setShowOnlyStuck(event.target.checked)}
            />
            Mostrar apenas leads parados ha 3+ dias
          </label>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {hasActiveFilters
                ? "O board abaixo ja respeita os filtros selecionados."
                : "Nenhum filtro ativo no momento."}
            </p>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700 sm:w-auto"
              onClick={() => {
                setSearchTerm("");
                setPriorityFilter("all");
                setOriginFilter("all");
                setStageFilter("all");
                setShowOnlyStuck(false);
              }}
              disabled={!hasActiveFilters}
            >
              <X className="h-4 w-4" aria-hidden />
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      <div className="flex h-full snap-x snap-mandatory gap-5 overflow-x-auto pb-2 scroll-px-1">
        {visibleColumns.map((column) => {
          const isOver = overColumnId === column.id;
          const cards = visibleColumnData[column.id];
          const hasHiddenCards = columnData[column.id].length > 0 && cards.length === 0;
          const stageIndex = STATUS_ORDER.indexOf(column.id);

          return (
            <div
              key={column.id}
              className={clsx(
                "app-stage-column flex min-h-[560px] min-w-[320px] flex-1 snap-start flex-col rounded-2xl border border-slate-200 border-t-4 bg-white/60 p-4 backdrop-blur",
                column.toneClass,
                isOver ? "ring-2 ring-blue-500/30" : ""
              )}
              onDragOver={(event) => handleDragOver(event, column.id)}
              onDrop={(event) => handleDropOnColumn(event, column.id)}
              aria-label={`Coluna ${column.label}`}
              role="region"
            >
              <div className="sticky top-4 z-10 flex items-center justify-between rounded-xl border border-slate-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "rounded-full px-2 py-1 text-xs font-semibold",
                      column.colorClass
                    )}
                  >
                    {column.label}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {cards.length}
                  </span>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                  aria-label={`Adicionar lead na coluna ${column.label}`}
                  onClick={() => openCreateModal(column.id)}
                >
                  +
                </button>
              </div>

              <motion.div
                layout
                className="mt-4 flex flex-1 flex-col gap-4"
                role="list"
                aria-label={`Leads da coluna ${column.label}`}
              >
                <AnimatePresence mode="popLayout">
                  {cards.map((card) => (
                    <SaleCard
                      key={card.id}
                      card={card}
                      isActive={activeCardId === card.id}
                      onDragStart={(event, cardId, status) => {
                        event.dataTransfer.setData("text/plain", cardId);
                        event.dataTransfer.effectAllowed = "move";
                        handleDragStart(cardId, status);
                      }}
                      onDragEnd={handleDragEnd}
                      onMoveLeft={() => moveRelative(card.id, card.etapa, "prev")}
                      onMoveRight={() => moveRelative(card.id, card.etapa, "next")}
                      canMoveLeft={stageIndex > 0}
                      canMoveRight={stageIndex < STATUS_ORDER.length - 1}
                    />
                  ))}
                </AnimatePresence>

                {cards.length === 0 && (
                  <div className="app-dropzone flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm">
                    {hasHiddenCards ? "Nenhum lead corresponde aos filtros" : "Solte o lead aqui"}
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCreateModal}
          >
            <motion.div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/60 bg-white p-6 shadow-2xl"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-600">Novo lead</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">
                    Criar oportunidade no funil
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Preencha os dados essenciais e o lead entra na etapa escolhida.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                  onClick={closeCreateModal}
                  aria-label="Fechar modal"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Nome do lead
                  </span>
                  <input
                    className="brand-input"
                    placeholder="Ex: Maria Silva"
                    value={createForm.nome}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        nome: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Empresa
                  </span>
                  <input
                    className="brand-input"
                    placeholder="Ex: Silva Consultoria"
                    value={createForm.empresa}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        empresa: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Orcamento (R$)
                  </span>
                  <input
                    className="brand-input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="5000"
                    value={createForm.orcamento}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        orcamento: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Prioridade
                  </span>
                  <select
                    className="brand-input"
                    value={createForm.prioridade}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        prioridade: event.target.value as KanbanCardType["prioridade"],
                      }))
                    }
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Etapa inicial
                  </span>
                  <select
                    className="brand-input"
                    value={createForm.etapa}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        etapa: event.target.value as Status,
                      }))
                    }
                  >
                    {COLUMN_CONFIG.map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Origem
                  </span>
                  <select
                    className="brand-input"
                    value={createForm.origem}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        origem: event.target.value as KanbanCardType["origem"],
                      }))
                    }
                  >
                    {originOptions
                      .filter((option) => option.value !== "all")
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Vendedor responsavel
                  </span>
                  <input
                    className="brand-input"
                    placeholder="Ex: Joao Santos"
                    value={createForm.vendedorNome}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        vendedorNome: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Proximo follow-up
                  </span>
                  <input
                    className="brand-input"
                    type="date"
                    value={createForm.proximoFollowupEm}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        proximoFollowupEm: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Tags (separadas por virgula)
                  </span>
                  <input
                    className="brand-input"
                    placeholder="quente, decisor, grande-ticket"
                    value={createForm.tags}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        tags: event.target.value,
                      }))
                    }
                  />
                </label>

                <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                    onClick={closeCreateModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Salvar lead
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
