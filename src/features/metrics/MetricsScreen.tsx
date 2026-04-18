"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ConversionChart, LossReasonChart } from "@/components/crm";
import { Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import type { MetricsPayload } from "@/types";

type MetricsScreenProps = {
  payload: MetricsPayload;
};

export const MetricsScreen = ({ payload }: MetricsScreenProps) => (
  <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Metricas e relatorios</h2>
        <p className="text-sm text-slate-500">Visao de conversao, origem, perdas e ganhos por periodo.</p>
      </div>
      <div className="flex gap-2">
        <Select defaultValue="30d">
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="90d">90 dias</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas origens</SelectItem>
            {payload.leadsBySource.map((source) => (
              <SelectItem key={source.source} value={source.source}>
                {source.source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
      <ConversionChart data={payload.conversionByStage} />
      <LossReasonChart data={payload.lossReasons} />
    </div>

    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leads por origem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payload.leadsBySource}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                <XAxis dataKey="source" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ganhos vs Perdidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payload.gainsVsLosses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ganhos" stroke="#059669" strokeWidth={2} />
                <Line type="monotone" dataKey="perdidos" stroke="#dc2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tempo medio ate contato</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-slate-900">{payload.avgFirstContactHours.toFixed(1)}h</p>
        <p className="text-sm text-slate-500">Media considerando leads com interacao registrada.</p>
      </CardContent>
    </Card>
  </section>
);
