"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const OnboardingForm = () => {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setTimezone(detected);
      }
    } catch {
      setTimezone("America/Sao_Paulo");
    }
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/onboarding/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName, timezone })
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message ?? "Falha ao criar workspace.");
        return;
      }

      router.replace("/app");
      router.refresh();
    } catch {
      setError("Falha de rede ao criar workspace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-[40rem] px-4 sm:mt-14">
      <form onSubmit={submit} className="surface-elevated crm-fade-up space-y-5 p-6 sm:p-8">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Boas-vindas</p>
          <h1 className="mt-1 text-2xl font-bold text-[color:var(--text-primary)]">Onboarding do workspace</h1>
          <p className="mt-2 text-sm text-muted">
            Defina seu ambiente inicial para comecar o funil comercial com pipeline padrao.
          </p>
        </header>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Nome do workspace
            </span>
            <input
              className="brand-input"
              placeholder="Aithos Sales"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Fuso horario
            </span>
            <input
              className="brand-input"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              required
            />
          </label>
        </div>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <button type="submit" className="brand-button w-full" disabled={loading}>
          {loading ? "Criando..." : "Criar workspace"}
        </button>
      </form>
    </div>
  );
};
