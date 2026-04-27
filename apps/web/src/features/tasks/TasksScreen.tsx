"use client";

import * as React from "react";
import { TaskList } from "@/components/crm";
import { Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { useTaskFilters } from "@/hooks/use-task-filters";
import type { TasksPayload } from "@/types";

type TasksScreenProps = {
  payload: TasksPayload;
};

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const TasksScreen = ({ payload }: TasksScreenProps) => {
  const { filters, setFilters, filteredTasks } = useTaskFilters(payload.tasks);
  const leadsById = React.useMemo(() => new Map(payload.leads.map((lead) => [lead.id, lead])), [payload.leads]);
  const now = Date.now();
  const today = dayStart(new Date());

  const overdue = filteredTasks.filter((task) => task.status === "pending" && new Date(task.dueAt).getTime() < now);
  const todayTasks = filteredTasks.filter((task) => {
    const due = dayStart(new Date(task.dueAt));
    return task.status === "pending" && due === today;
  });
  const upcoming = filteredTasks.filter((task) => task.status === "pending" && dayStart(new Date(task.dueAt)) > today);

  const assignees = Array.from(new Set(payload.tasks.map((task) => task.assignee).filter(Boolean))) as string[];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Tarefas e follow-up</h2>
        <p className="text-sm text-slate-500">Controle de urgencia organizada para o time comercial.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          <Select
            value={filters.status}
            onValueChange={(value: typeof filters.status) => setFilters((current) => ({ ...current, status: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="completed">Concluidas</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.leadId}
            onValueChange={(value: typeof filters.leadId) => setFilters((current) => ({ ...current, leadId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Lead" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos leads</SelectItem>
              {payload.leads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.assignee}
            onValueChange={(value: typeof filters.assignee) =>
              setFilters((current) => ({ ...current, assignee: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Responsavel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos responsaveis</SelectItem>
              {assignees.map((assignee) => (
                <SelectItem key={assignee} value={assignee}>
                  {assignee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <TaskList title="Atrasadas" tasks={overdue} leadsById={leadsById} />
        <TaskList title="Hoje" tasks={todayTasks} leadsById={leadsById} />
        <TaskList title="Futuras" tasks={upcoming} leadsById={leadsById} />
      </div>
    </section>
  );
};
