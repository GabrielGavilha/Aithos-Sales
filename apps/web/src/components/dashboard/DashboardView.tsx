"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { AlertTriangle, BarChart3, Clock3, Download, Funnel, Users } from "lucide-react";
import type { DashboardMetrics } from "@aithos/db";

type DashboardViewProps = {
  workspaceId: string;
  metrics: DashboardMetrics;
  currentPeriod: "7d" | "30d" | "90d" | "custom";
  customFrom?: string;
  customTo?: string;
};

const percent = (value: number, total: number) => (total > 0 ? (value / total) * 100 : 0);

export const DashboardView = ({
  workspaceId,
  metrics,
  currentPeriod,
  customFrom,
  customTo
}: DashboardViewProps) => {
  const [exporting, setExporting] = useState(false);

  const totalsByStage = metrics.leadsByStage.reduce((sum, item) => sum + item.total, 0);
  const weeklyMax = Math.max(...metrics.weeklyLeads.map((week) => week.total), 1);

  const periodLinks: Array<{ value: DashboardViewProps["currentPeriod"]; label: string; href: string }> = [
    { value: "7d", label: "7 dias", href: "/app?period=7d" },
    { value: "30d", label: "30 dias", href: "/app?period=30d" },
    { value: "90d", label: "90 dias", href: "/app?period=90d" },
    { value: "custom", label: "Personalizado", href: "/app?period=custom" }
  ];

  const exportCsv = async () => {
    setExporting(true);

    try {
      const response = await fetch(`/api/exports/leads?workspaceId=${workspaceId}`);
      if (!response.ok) {
        throw new Error();
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `leads-${workspaceId}.csv`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="surface-card crm-fade-up-slow flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Visao geral</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {periodLinks.map((period) => (
              <Link
                key={period.value}
                href={period.href}
                className={clsx("brand-pill-link", { "is-active": currentPeriod === period.value })}
              >
                {period.label}
              </Link>
            ))}
          </div>
        </div>

        <button type="button" className="brand-button" onClick={exportCsv}>
          <Download className="h-4 w-4" aria-hidden />
          {exporting ? "Gerando CSV..." : "Exportar CSV"}
        </button>
      </div>

      {currentPeriod === "custom" ? (
        <div className="surface-card crm-fade-up-slow crm-delay-soft-1 flex flex-wrap items-center justify-between gap-2 p-4 text-sm text-muted">
          <span className="font-medium text-[color:var(--text-primary)]">Periodo personalizado ativo</span>
          <span>
            {customFrom || "-"} ate {customTo || "-"}
          </span>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="surface-card crm-fade-up-slow crm-delay-soft-1 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">Leads hoje</p>
          <p className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">{metrics.leadsToday}</p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted">
            <Users className="h-3.5 w-3.5" aria-hidden />
            Novos contatos no dia
          </div>
        </article>

        <article className="surface-card crm-fade-up-slow crm-delay-soft-2 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">Conversao novo para ganho</p>
          <p className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">
            {metrics.conversionNovoToGanho.toFixed(1)}%
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted">
            <Funnel className="h-3.5 w-3.5" aria-hidden />
            Efetividade do funil
          </div>
        </article>

        <article className="surface-card crm-fade-up-slow crm-delay-soft-3 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">Primeiro contato medio</p>
          <p className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">
            {metrics.avgTimeToFirstContactHours.toFixed(1)}h
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted">
            <Clock3 className="h-3.5 w-3.5" aria-hidden />
            Tempo de resposta inicial
          </div>
        </article>

        <article className="surface-card crm-fade-up-slow crm-delay-soft-4 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">Leads parados</p>
          <p className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">{metrics.stalledLeads}</p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            Oportunidades sem follow-up
          </div>
        </article>

        <article className="surface-card crm-fade-up-slow crm-delay-soft-5 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-muted">Total no funil</p>
          <p className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">{totalsByStage}</p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden />
            Volume ativo de leads
          </div>
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="surface-card crm-fade-up-slow crm-delay-soft-2 p-5">
          <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Leads por semana (8 semanas)</h2>
          <p className="mb-4 mt-1 text-sm text-muted">Evolucao de entrada para orientar cadencia comercial.</p>

          <div className="space-y-3">
            {metrics.weeklyLeads.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-muted">
                  <span>{item.label}</span>
                  <span>{item.total}</span>
                </div>
                <div className="h-3 rounded-full bg-blue-100/70">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-700"
                    style={{ width: `${percent(item.total, weeklyMax)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="surface-card crm-fade-up-slow crm-delay-soft-3 p-5">
            <h2 className="mb-1 text-lg font-semibold text-[color:var(--text-primary)]">Leads por stage</h2>
            <p className="mb-3 text-sm text-muted">Distribuicao atual entre as etapas do funil.</p>

            <div className="space-y-2">
              {metrics.leadsByStage.map((item) => {
                const width = percent(item.total, totalsByStage || 1);
                return (
                  <div
                    key={item.stageId}
                    className="rounded-xl border border-[color:var(--brand-border)] bg-white/60 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-accent)] hover:bg-white/85"
                  >
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-[color:var(--text-primary)]">{item.stageName}</span>
                      <span className="text-muted">{item.total}</span>
                    </div>
                    <div className="h-2 rounded-full bg-blue-100/70">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-card crm-fade-up-slow crm-delay-soft-4 p-5">
            <h2 className="mb-1 text-lg font-semibold text-[color:var(--text-primary)]">Top 5 motivos de perda</h2>
            <p className="mb-3 text-sm text-muted">Principais causas para orientar ajustes no processo.</p>

            {metrics.topLossReasons.length === 0 ? (
              <p className="text-sm text-muted">Sem perdas registradas no periodo.</p>
            ) : (
              <div className="space-y-2">
                {metrics.topLossReasons.map((item) => (
                  <div
                    key={item.reason}
                    className="flex items-center justify-between rounded-xl border border-[color:var(--brand-border)] bg-white/60 px-3 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-accent)] hover:bg-white/85"
                  >
                    <span className="text-muted">{item.reason}</span>
                    <span className="font-semibold text-[color:var(--text-primary)]">{item.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};
