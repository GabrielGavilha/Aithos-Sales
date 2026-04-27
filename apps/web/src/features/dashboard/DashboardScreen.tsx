"use client";

import Link from "next/link";
import { AlertTriangle, Clock3, Download, KanbanSquare } from "lucide-react";
import { ConversionChart, LossReasonChart, MetricCard } from "@/components/crm";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { DashboardPayload } from "@/types";

type DashboardScreenProps = {
  data: DashboardPayload;
};

export const DashboardScreen = ({ data }: DashboardScreenProps) => {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white/90 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Dashboard estrategico</p>
          <h2 className="text-lg font-semibold text-slate-900">Visao operacional da semana</h2>
          <p className="text-sm text-slate-500">Ultimos 30 dias</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/export">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </Link>
          <Link href="/app/pipeline">
            <Button size="sm">
              <KanbanSquare className="h-4 w-4" />
              Abrir funil
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <ConversionChart data={data.conversionByStage} />
        <LossReasonChart data={data.lossReasons} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <Clock3 className="h-4 w-4 text-amber-600" />
              Tarefas vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.overdueTasks.length === 0 ? (
              <p className="text-sm text-slate-500">Sem tarefas vencidas.</p>
            ) : (
              <div className="space-y-2">
                {data.overdueTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2">
                    <p className="text-sm font-medium text-slate-800">{task.title}</p>
                    <p className="text-xs font-semibold text-amber-700">{new Date(task.dueAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Leads sem follow-up
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.leadsWithoutFollowUp.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum lead parado no momento.</p>
            ) : (
              <div className="space-y-2">
                {data.leadsWithoutFollowUp.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.company ?? "Sem empresa"}</p>
                    </div>
                    <Badge variant="warning">Parado</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
