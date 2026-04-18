import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { LeadEvent } from "@/types";

const eventLabel: Record<LeadEvent["type"], string> = {
  created: "Lead criado",
  updated: "Lead atualizado",
  stage_changed: "Etapa alterada",
  note_added: "Nota adicionada",
  task_created: "Tarefa criada",
  task_completed: "Tarefa concluida",
  closed: "Lead fechado"
};

export const LeadTimeline = ({ events }: { events: LeadEvent[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Timeline</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {events.length === 0 ? (
        <p className="text-sm text-slate-500">Sem eventos registrados.</p>
      ) : (
        events.map((event) => (
          <article key={event.id} className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
            <p className="text-sm font-semibold text-slate-900">{eventLabel[event.type]}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
              <CalendarClock className="h-3.5 w-3.5" />
              {new Date(event.createdAt).toLocaleString("pt-BR")}
            </p>
            {Object.keys(event.payload).length > 0 ? (
              <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-white p-2 text-xs text-slate-600">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            ) : null}
          </article>
        ))
      )}
    </CardContent>
  </Card>
);
