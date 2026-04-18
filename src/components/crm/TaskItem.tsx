import { CalendarClock, CheckCircle2, MessageCircle, RefreshCw } from "lucide-react";
import { Button, Card } from "@/components/ui";
import type { Lead, Task } from "@/types";

type TaskItemProps = {
  task: Task;
  lead?: Lead;
  onComplete?: (task: Task) => void;
  onReschedule?: (task: Task) => void;
};

const dueTone = (dueAt: string, status: Task["status"]) => {
  if (status === "completed") return "text-emerald-600";
  return new Date(dueAt).getTime() < Date.now() ? "text-rose-600" : "text-amber-600";
};

export const TaskItem = ({ task, lead, onComplete, onReschedule }: TaskItemProps) => (
  <Card className="p-4 transition-transform hover:-translate-y-0.5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <p className="font-semibold text-slate-900">{task.title}</p>
        <p className="text-xs text-slate-500">{lead ? `${lead.name} • ${lead.company ?? "Sem empresa"}` : "Lead nao encontrado"}</p>
        <p className={`inline-flex items-center gap-1 text-xs font-semibold ${dueTone(task.dueAt, task.status)}`}>
          <CalendarClock className="h-3.5 w-3.5" />
          {new Date(task.dueAt).toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {task.status === "pending" ? (
          <Button size="sm" variant="success" onClick={() => onComplete?.(task)}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Concluir
          </Button>
        ) : (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Concluida</span>
        )}
        <Button size="sm" variant="secondary" onClick={() => onReschedule?.(task)}>
          <RefreshCw className="h-3.5 w-3.5" />
          Remarcar
        </Button>
        {lead ? (
          <a
            href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-blue-200 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-50"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  </Card>
);
