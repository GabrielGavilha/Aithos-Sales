import { TaskItem } from "@/components/crm/TaskItem";
import { EmptyState } from "@/components/crm/EmptyState";
import type { Lead, Task } from "@/types";

type TaskListProps = {
  title: string;
  tasks: Task[];
  leadsById: Map<string, Lead>;
  onComplete?: (task: Task) => void;
  onReschedule?: (task: Task) => void;
};

export const TaskList = ({ title, tasks, leadsById, onComplete, onReschedule }: TaskListProps) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{tasks.length}</span>
    </div>
    {tasks.length === 0 ? (
      <EmptyState
        title="Nenhuma tarefa nesta faixa"
        description="Quando houver tarefas nesta categoria, elas aparecerao aqui para execucao rapida."
      />
    ) : (
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            lead={leadsById.get(task.leadId)}
            onComplete={onComplete}
            onReschedule={onReschedule}
          />
        ))}
      </div>
    )}
  </section>
);
