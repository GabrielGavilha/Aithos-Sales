"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { CaptureForm, WorkspaceMember } from "@/lib/types";

type WorkspaceSettingsProps = {
  workspaceId: string;
  workspaceSlug: string;
  members: WorkspaceMember[];
  forms: CaptureForm[];
};

export const WorkspaceSettings = ({
  workspaceId,
  workspaceSlug,
  members,
  forms
}: WorkspaceSettingsProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "admin" | "member">("member");
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error" | "neutral">("neutral");
  const [sending, setSending] = useState(false);

  const [formState, setFormState] = useState(forms);
  const [savingFormId, setSavingFormId] = useState<string | null>(null);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.role === b.role) return 0;
      if (a.role === "owner") return -1;
      if (b.role === "owner") return 1;
      if (a.role === "admin") return -1;
      if (b.role === "admin") return 1;
      return 0;
    });
  }, [members]);

  const sendInvite = async () => {
    if (!email.trim()) {
      return;
    }

    setSending(true);
    setMessage(null);
    setMessageTone("neutral");

    try {
      const response = await fetch("/api/invites/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, email, role })
      });

      const data = (await response.json()) as { inviteUrl?: string; message?: string };

      if (!response.ok) {
        setMessage(data.message ?? "Falha ao enviar convite.");
        setMessageTone("error");
        return;
      }

      setMessage(`Convite enviado. URL de teste: ${data.inviteUrl}`);
      setMessageTone("success");
      setEmail("");
    } finally {
      setSending(false);
    }
  };

  const toggleField = (formId: string, key: string, prop: "enabled" | "required") => {
    setFormState((current) =>
      current.map((form) => {
        if (form.id !== formId) {
          return form;
        }

        return {
          ...form,
          fields: form.fields.map((field) =>
            field.key === key ? { ...field, [prop]: !field[prop] } : field
          )
        };
      })
    );
  };

  const updateText = (
    formId: string,
    prop: "title" | "description" | "consentText" | "successMessage",
    value: string
  ) => {
    setFormState((current) =>
      current.map((form) => (form.id === formId ? { ...form, [prop]: value } : form))
    );
  };

  const saveForm = async (form: CaptureForm) => {
    setSavingFormId(form.id);
    setMessageTone("neutral");

    try {
      const response = await fetch(`/api/forms/${form.id}?workspaceId=${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          fields: form.fields,
          consentText: form.consentText,
          successMessage: form.successMessage
        })
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message ?? "Falha ao salvar configuracoes do formulario.");
        setMessageTone("error");
        return;
      }

      setMessage(`Formulario ${form.title} atualizado com sucesso.`);
      setMessageTone("success");
    } finally {
      setSavingFormId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="surface-card crm-fade-up-slow p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Membros</p>
            <h2 className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">Convites de workspace</h2>
            <p className="mt-1 text-sm text-muted">Convites expiram automaticamente em 48 horas.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-[2fr,1fr,auto]">
          <input
            className="brand-input"
            placeholder="email@empresa.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <select
            className="brand-input"
            value={role}
            onChange={(event) => setRole(event.target.value as typeof role)}
          >
            <option value="member">member</option>
            <option value="admin">admin</option>
            <option value="owner">owner</option>
          </select>
          <button type="button" className="brand-button" onClick={sendInvite} disabled={sending}>
            {sending ? "Enviando..." : "Convidar"}
          </button>
        </div>

        {message ? (
          <p
            className={clsx("mt-3 rounded-xl border px-3 py-2 text-sm", {
              "border-emerald-200 bg-emerald-50 text-emerald-700": messageTone === "success",
              "border-red-200 bg-red-50 text-red-700": messageTone === "error",
              "border-[color:var(--brand-border)] bg-white/70 text-muted": messageTone === "neutral"
            })}
          >
            {message}
          </p>
        ) : null}
      </section>

      <section className="surface-card crm-fade-up-slow crm-delay-soft-1 p-5">
        <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Membros do workspace</h2>
        <div className="mt-3 space-y-2">
          {sortedMembers.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between rounded-xl border border-[color:var(--brand-border)] bg-white/65 px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-accent)] hover:bg-white/85"
            >
              <div>
                <p className="text-sm font-semibold text-[color:var(--text-primary)]">{member.displayName}</p>
                <p className="text-xs text-muted">{member.email}</p>
              </div>
              <span className="brand-badge">{member.role}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {formState.map((form, index) => (
          <article
            key={form.id}
            className="surface-card crm-fade-up-slow space-y-4 p-5"
            style={{ animationDelay: `${Math.min(index * 90 + 180, 420)}ms` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Formulario</p>
                <h3 className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">
                  Configuracao do formulario
                </h3>
              </div>
              <p className="rounded-full border border-[color:var(--brand-border)] bg-white/60 px-3 py-1 text-xs text-muted">
                URL publica: /f/{workspaceSlug}/{form.id}
              </p>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">Titulo</span>
              <input
                className="brand-input"
                value={form.title}
                onChange={(event) => updateText(form.id, "title", event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">Descricao</span>
              <textarea
                className="brand-input min-h-24"
                value={form.description ?? ""}
                onChange={(event) => updateText(form.id, "description", event.target.value)}
              />
            </label>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Campos configuraveis</p>
              <div className="space-y-2">
                {form.fields.map((field) => (
                  <div
                    key={field.key}
                    className="rounded-xl border border-[color:var(--brand-border)] bg-white/65 px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-accent)] hover:bg-white/85"
                  >
                    <p className="text-sm font-semibold text-[color:var(--text-primary)]">{field.label}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={field.enabled}
                          onChange={() => toggleField(form.id, field.key, "enabled")}
                          className="h-4 w-4 accent-blue-600"
                        />
                        Ativo
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={() => toggleField(form.id, field.key, "required")}
                          className="h-4 w-4 accent-blue-600"
                        />
                        Obrigatorio
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">Texto LGPD</span>
              <textarea
                className="brand-input min-h-24"
                value={form.consentText}
                onChange={(event) => updateText(form.id, "consentText", event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">Mensagem de sucesso</span>
              <textarea
                className="brand-input min-h-24"
                value={form.successMessage}
                onChange={(event) => updateText(form.id, "successMessage", event.target.value)}
              />
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                className="brand-button"
                onClick={() => saveForm(form)}
                disabled={savingFormId === form.id}
              >
                {savingFormId === form.id ? "Salvando..." : "Salvar configuracoes"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
