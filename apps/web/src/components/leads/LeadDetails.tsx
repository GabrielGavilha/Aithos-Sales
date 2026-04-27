"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageCircle, Plus, Tag, XCircle } from "lucide-react";
import type { Lead, LeadEvent, LeadTask } from "@aithos/db";

type LeadDetailsProps = {
  workspaceId: string;
  lead: Lead;
  tasks: LeadTask[];
  events: LeadEvent[];
  nextCursor: string | null;
};

const eventLabel: Record<LeadEvent["type"], string> = {
  created: "Lead criado",
  stage_changed: "Stage alterado",
  note_added: "Nota adicionada",
  task_created: "Tarefa criada",
  task_completed: "Tarefa concluida",
  closed: "Lead fechado"
};

export const LeadDetails = ({ workspaceId, lead, tasks, events, nextCursor }: LeadDetailsProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [note, setNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [closeReason, setCloseReason] = useState("");
  const [timeline, setTimeline] = useState(events);
  const [timelineCursor, setTimelineCursor] = useState(nextCursor);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const whatsappLink = useMemo(() => {
    const number = lead.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Ola ${lead.name}, tudo bem? Estou entrando em contato sobre ${lead.need || "sua necessidade"}...`
    );
    return `https://wa.me/55${number}?text=${message}`;
  }, [lead.name, lead.need, lead.phone]);

  const submitNote = async () => {
    if (!note.trim()) {
      return;
    }

    const response = await fetch(`/api/leads/${lead.id}/notes?workspaceId=${workspaceId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note })
    });

    if (response.ok) {
      setNote("");
      router.refresh();
    }
  };

  const submitTask = async () => {
    if (!taskTitle.trim() || !taskDueAt) {
      return;
    }

    const response = await fetch(`/api/leads/${lead.id}/tasks?workspaceId=${workspaceId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: taskTitle, dueAt: taskDueAt })
    });

    if (response.ok) {
      setTaskTitle("");
      setTaskDueAt("");
      router.refresh();
    }
  };

  const completeTask = async (taskId: string) => {
    const response = await fetch(
      `/api/leads/${lead.id}/tasks/${taskId}/complete?workspaceId=${workspaceId}`,
      {
        method: "POST"
      }
    );

    if (response.ok) {
      router.refresh();
    }
  };

  const saveTags = async (tags: string[]) => {
    const response = await fetch(`/api/leads/${lead.id}/tags?workspaceId=${workspaceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags })
    });

    if (response.ok) {
      router.refresh();
    }
  };

  const addTag = async () => {
    if (!tagInput.trim()) {
      return;
    }

    const tags = Array.from(new Set([...(lead.tags ?? []), tagInput.trim()]));
    await saveTags(tags);
    setTagInput("");
  };

  const removeTag = async (tag: string) => {
    const tags = (lead.tags ?? []).filter((item) => item !== tag);
    await saveTags(tags);
  };

  const closeLead = async (status: "won" | "lost") => {
    if (!closeReason.trim()) {
      return;
    }

    const response = await fetch(`/api/leads/${lead.id}/close?workspaceId=${workspaceId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason: closeReason })
    });

    if (response.ok) {
      setCloseReason("");
      router.refresh();
    }
  };

  const loadMoreTimeline = async () => {
    if (!timelineCursor) {
      return;
    }

    setLoadingTimeline(true);

    try {
      const response = await fetch(
        `/api/leads/${lead.id}/events?workspaceId=${workspaceId}&cursor=${encodeURIComponent(
          timelineCursor
        )}`
      );

      const data = (await response.json()) as { events: LeadEvent[]; nextCursor: string | null };

      if (response.ok) {
        setTimeline((current) => [...current, ...data.events]);
        setTimelineCursor(data.nextCursor);
      }
    } finally {
      setLoadingTimeline(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.18fr,0.82fr]">
      <section className="space-y-5">
        <article className="surface-card crm-fade-up p-5">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Lead</p>
              <h2 className="mt-1 text-2xl font-bold text-[color:var(--text-primary)]">{lead.name}</h2>
              <p className="mt-1 text-sm text-muted">{lead.company || "Sem empresa"}</p>
            </div>

            <a href={whatsappLink} target="_blank" rel="noreferrer" className="brand-button">
              <MessageCircle className="h-4 w-4" aria-hidden />
              Abrir no WhatsApp
            </a>
          </header>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white/65 p-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-accent)] hover:bg-white/85">
              <p className="text-xs uppercase tracking-[0.06em] text-muted">E-mail</p>
              <p className="mt-1 font-medium text-[color:var(--text-primary)]">{lead.email || "-"}</p>
            </div>
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white/65 p-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-accent)] hover:bg-white/85">
              <p className="text-xs uppercase tracking-[0.06em] text-muted">Telefone</p>
              <p className="mt-1 font-medium text-[color:var(--text-primary)]">{lead.phone}</p>
            </div>
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white/65 p-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-accent)] hover:bg-white/85">
              <p className="text-xs uppercase tracking-[0.06em] text-muted">Necessidade</p>
              <p className="mt-1 font-medium text-[color:var(--text-primary)]">{lead.need || "-"}</p>
            </div>
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white/65 p-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-accent)] hover:bg-white/85">
              <p className="text-xs uppercase tracking-[0.06em] text-muted">Stage atual</p>
              <p className="mt-1 font-medium text-[color:var(--text-primary)]">{lead.stageId}</p>
            </div>
          </div>
        </article>

        <article className="surface-card crm-fade-up crm-delay-1 space-y-4 p-5">
          <div>
            <h3 className="text-base font-semibold text-[color:var(--text-primary)]">Notas da conversa</h3>
            <p className="text-sm text-muted">Registre os principais pontos para manter contexto comercial.</p>
          </div>
          <textarea
            className="brand-input min-h-28"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Resumo da conversa"
          />
          <button type="button" className="brand-button" onClick={() => startTransition(submitNote)}>
            Salvar nota
          </button>
        </article>

        <article className="surface-card crm-fade-up crm-delay-2 space-y-4 p-5">
          <div>
            <h3 className="text-base font-semibold text-[color:var(--text-primary)]">Tarefas do lead</h3>
            <p className="text-sm text-muted">Planeje proximos contatos e acompanhe execucao.</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="brand-input"
              placeholder="Titulo da tarefa"
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
            />
            <input
              className="brand-input"
              type="datetime-local"
              value={taskDueAt}
              onChange={(event) => setTaskDueAt(event.target.value)}
            />
          </div>

          <button type="button" className="brand-button" onClick={() => startTransition(submitTask)}>
            Criar tarefa
          </button>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-xl border border-[color:var(--brand-border)] bg-white/65 px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-accent)] hover:bg-white/85"
              >
                <div>
                  <p className="text-sm font-medium text-[color:var(--text-primary)]">{task.title}</p>
                  <p className="text-xs text-muted">Vence em {new Date(task.dueAt).toLocaleString("pt-BR")}</p>
                </div>
                {task.status === "pending" ? (
                  <button
                    type="button"
                    className="brand-button-secondary text-xs"
                    onClick={() => startTransition(() => completeTask(task.id))}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Concluir
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600">Concluida</span>
                )}
              </div>
            ))}
          </div>
        </article>
      </section>

      <aside className="space-y-5">
        <section className="surface-card crm-fade-up crm-delay-1 p-5">
          <h3 className="text-base font-semibold text-[color:var(--text-primary)]">Tags</h3>
          <p className="mb-3 text-sm text-muted">Classifique o lead para facilitar filtros e segmentacao.</p>

          <div className="mb-3 flex flex-wrap gap-2">
            {lead.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="brand-badge"
                onClick={() => startTransition(() => removeTag(tag))}
              >
                <Tag className="mr-1 h-3 w-3" aria-hidden />
                {tag}
                <XCircle className="ml-1 h-3 w-3" aria-hidden />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              className="brand-input"
              placeholder="Nova tag"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
            />
            <button type="button" className="brand-button" onClick={() => startTransition(addTag)}>
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </section>

        <section className="surface-card crm-fade-up crm-delay-2 p-5">
          <h3 className="text-base font-semibold text-[color:var(--text-primary)]">Fechamento</h3>
          <p className="mb-3 text-sm text-muted">Registre o resultado da oportunidade com motivo.</p>
          <textarea
            className="brand-input min-h-24"
            value={closeReason}
            onChange={(event) => setCloseReason(event.target.value)}
            placeholder="Motivo"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className="brand-button" onClick={() => startTransition(() => closeLead("won"))}>
              Ganho
            </button>
            <button
              type="button"
              className="brand-button-secondary"
              onClick={() => startTransition(() => closeLead("lost"))}
            >
              Perdido
            </button>
          </div>
        </section>

        <section className="surface-card crm-fade-up crm-delay-3 p-5">
          <h3 className="text-base font-semibold text-[color:var(--text-primary)]">Timeline</h3>
          <p className="mb-3 text-sm text-muted">Historico cronologico de interacoes e alteracoes.</p>

          <div className="max-h-[560px] space-y-2 overflow-auto pr-1">
            {timeline.map((event) => (
              <article key={event.id} className="rounded-xl border border-[color:var(--brand-border)] bg-white/65 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-accent)] hover:bg-white/85">
                <p className="text-sm font-semibold text-[color:var(--text-primary)]">{eventLabel[event.type]}</p>
                <p className="text-xs text-muted">{new Date(event.createdAt).toLocaleString("pt-BR")}</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-muted">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </article>
            ))}
          </div>

          {timelineCursor ? (
            <button
              type="button"
              className="brand-button-secondary mt-3 w-full"
              onClick={loadMoreTimeline}
              disabled={loadingTimeline}
            >
              {loadingTimeline ? "Carregando..." : "Carregar mais"}
            </button>
          ) : null}
        </section>
      </aside>

      {isPending ? <p className="text-sm text-muted">Sincronizando...</p> : null}
    </div>
  );
};
