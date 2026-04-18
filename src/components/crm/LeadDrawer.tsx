"use client";

import * as React from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { LeadHeader } from "@/components/crm/LeadHeader";
import { LeadTimeline } from "@/components/crm/LeadTimeline";
import { TaskItem } from "@/components/crm/TaskItem";
import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea
} from "@/components/ui";
import type { Lead, LeadEvent, Task } from "@/types";

type LeadDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  tasks: Task[];
  events: LeadEvent[];
  onCreateTask?: (payload: { title: string; dueAt: string }) => Promise<void> | void;
  onAddNote?: (note: string) => Promise<void> | void;
  onCompleteTask?: (task: Task) => Promise<void> | void;
};

export const LeadDrawer = ({
  open,
  onOpenChange,
  lead,
  tasks,
  events,
  onCreateTask,
  onAddNote,
  onCompleteTask
}: LeadDrawerProps) => {
  const [title, setTitle] = React.useState("");
  const [dueAt, setDueAt] = React.useState("");
  const [note, setNote] = React.useState("");

  if (!lead) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>LeadDrawer</SheetTitle>
          <SheetDescription>Painel rapido para visualizar lead, tarefas e timeline sem sair da tela.</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          <LeadHeader lead={lead} />

          <Tabs defaultValue="tasks">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="space-y-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-3">
                <p className="mb-2 text-sm font-semibold text-slate-900">Nova tarefa</p>
                <div className="grid gap-2 sm:grid-cols-[1fr,220px,auto]">
                  <Input placeholder="Titulo da tarefa" value={title} onChange={(event) => setTitle(event.target.value)} />
                  <Input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
                  <Button
                    onClick={async () => {
                      if (!title.trim() || !dueAt) return;
                      await onCreateTask?.({ title, dueAt });
                      setTitle("");
                      setDueAt("");
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Criar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskItem key={task.id} task={task} lead={lead} onComplete={(current) => onCompleteTask?.(current)} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="timeline">
              <LeadTimeline events={events} />
            </TabsContent>
            <TabsContent value="notes" className="space-y-2">
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Adicione observacoes desta conversa..." />
              <Button
                onClick={async () => {
                  if (!note.trim()) return;
                  await onAddNote?.(note);
                  setNote("");
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Salvar nota
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
