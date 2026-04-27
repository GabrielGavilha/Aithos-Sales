"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { LossReason } from "@/types";

const colors = ["#2563eb", "#3b82f6", "#38bdf8", "#f59e0b", "#ef4444", "#10b981"];

export const LossReasonChart = ({ data }: { data: LossReason[] }) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="text-base">Motivos de perda</CardTitle>
    </CardHeader>
    <CardContent>
      {data.length === 0 ? (
        <p className="text-sm text-slate-500">Sem perdas no periodo.</p>
      ) : (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="total" nameKey="reason" innerRadius={54} outerRadius={88} paddingAngle={2}>
                {data.map((entry, index) => (
                  <Cell key={entry.id} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-3 space-y-1.5">
        {data.map((item, index) => (
          <div key={item.id} className="flex items-center justify-between text-xs text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              {item.reason}
            </span>
            <strong>{item.total}</strong>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
