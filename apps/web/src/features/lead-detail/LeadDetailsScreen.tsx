"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, CheckCircle2, Flag, NotebookPen, Pencil, Plus } from "lucide-react";
import { LeadHeader, LeadTimeline, TaskItem } from "@/components/crm";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useToast
} from "@/components/ui";
import type { Lead, LeadDetailsPayload } from "@/types";

type LeadDetailsScreenProps = {
  workspaceId: string;
  payload: LeadDetailsPayload;
};

export const LeadDetailsScreen = ({ workspaceId, payload }: LeadDetailsScreenProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskDueAt, setTaskDueAt] = React.useState("");
  const [note, setNote] = React.useState("");
  const [closeReason, setCloseReason] = React.useState("");
  const [stageId, setStageId] = React.useState(payload.lead.stageId);
  const [saving, setSaving] = React.useState(false);

  const [editDraft, setEditDraft] = React.useState<Partial<Lead>>({
    name: payload.lead.name,
    phone: payload.lead.phone,
    email: payload.lead.email ?? "",
    company: payload.lead.company ?? "",
    need: payload.lead.need ?? "",
    budget: payload.lead.budget,
    deadline: payload.lead.deadline ?? "",
    source: payload.lead.source ?? "",
    priority: payload.lead.priority
  });

  const runAction = async (action: () => Promise<Response>, successMessage: string) => {
    setSaving(true);
    try {
      const response = await action();
      if (!response.ok) {
        toast({
          title: "Nao foi possivel concluir a acao",
          description: "Verifique os dados e tente novamente.",
          variant: "destructive"
        });
        return;
      }

      toast({ title: "Sucesso", description: successMessage, variant: "success" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[1.2fr,0.8fr]">
      <div className="space-y-4">
        <LeadHeader lead={payload.lead} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editar dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input value={editDraft.name ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Telefone</Label>
                <Input value={editDraft.phone ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, phone: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={editDraft.email ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Empresa</Label>
                <Input value={editDraft.company ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, company: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Orcamento (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editDraft.budget ?? ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, budget: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Prazo</Label>
                <Input value={editDraft.deadline ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, deadline: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Origem</Label>
                <Input value={editDraft.source ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, source: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Prioridade</Label>
                <Select value={editDraft.priority} onValueChange={(v) => setEditDraft((d) => ({ ...d, priority: v as Lead["priority"] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Necessidade</Label>
              <Textarea value={editDraft.need ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, need: e.target.value }))} rows={2} />
            </div>
            <Button
              disabled={saving}
              onClick={() =>
                runAction(
                  () =>
                    fetch(`/api/leads/${payload.lead.id}?workspaceId=${workspaceId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: editDraft.name,
                        phone: editDraft.phone,
                        email: editDraft.email || undefined,
                        company: editDraft.company || undefined,
                        need: editDraft.need || undefined,
                        budget: editDraft.budget ?? null,
                        deadline: editDraft.deadline || undefined,
                        source: editDraft.source || undefined,
                        priority: editDraft.priority
                      })
                    }),
                  "Dados do lead atualizados."
                )
              }
            >
              <Pencil className="h-4 w-4" />
              Salvar alteracoes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acoes principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-[1fr,auto]">
              <Select value={stageId} onValueChange={setStageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Mover etapa" />
                </SelectTrigger>
                <SelectContent>
                  {payload.stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                disabled={saving || stageId === payload.lead.stageId}
                onClick={() =>
                  runAction(
                    () =>
                      fetch("/api/pipeline/stage-move", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          workspaceId,
                          leadId: payload.lead.id,
                          fromStageId: payload.lead.stageId,
                          toStageId: stageId
                        })
                      }),
                    "Etapa atualizada."
                  )
                }
              >
                <ArrowRightLeft className="h-4 w-4" />
                Mover etapa
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="success"
                disabled={saving || !closeReason.trim()}
                onClick={() =>
                  runAction(
                    () =>
                      fetch(`/api/leads/${payload.lead.id}/close?workspaceId=${workspaceId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "won", reason: closeReason })
                      }),
                    "Lead marcado como ganho."
                  )
                }
              >
                <Flag className="h-4 w-4" />
                Marcar ganho
              </Button>
              <Button
                variant="danger"
                disabled={saving || !closeReason.trim()}
                onClick={() =>
                  runAction(
                    () =>
                      fetch(`/api/leads/${payload.lead.id}/close?workspaceId=${workspaceId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "lost", reason: closeReason })
                      }),
                    "Lead marcado como perdido."
                  )
                }
              >
                <Flag className="h-4 w-4" />
                Marcar perdido
              </Button>
            </div>

            <Textarea
              placeholder="Motivo de ganho/perda"
              value={closeReason}
              onChange={(event) => setCloseReason(event.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Registre pontos importantes da conversa..."
            />
            <Button
              disabled={saving || !note.trim()}
              onClick={() =>
                runAction(
                  () =>
                    fetch(`/api/leads/${payload.lead.id}/notes?workspaceId=${workspaceId}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ note })
                    }),
                  "Nota salva com sucesso."
                ).then(() => setNote(""))
              }
            >
              <NotebookPen className="h-4 w-4" />
              Salvar nota
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tarefas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-[1fr,220px,auto]">
              <Input value={taskTitle} placeholder="Titulo da tarefa" onChange={(event) => setTaskTitle(event.target.value)} />
              <Input type="datetime-local" value={taskDueAt} onChange={(event) => setTaskDueAt(event.target.value)} />
              <Button
                disabled={saving || !taskTitle.trim() || !taskDueAt}
                onClick={() =>
                  runAction(
                    () =>
                      fetch(`/api/leads/${payload.lead.id}/tasks?workspaceId=${workspaceId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: taskTitle, dueAt: taskDueAt })
                      }),
                    "Tarefa criada."
                  ).then(() => {
                    setTaskTitle("");
                    setTaskDueAt("");
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Nova tarefa
              </Button>
            </div>

            <div className="space-y-2">
              {payload.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  lead={payload.lead}
                  onComplete={(current) =>
                    runAction(
                      () =>
                        fetch(`/api/leads/${payload.lead.id}/tasks/${current.id}/complete?workspaceId=${workspaceId}`, {
                          method: "POST"
                        }),
                      "Tarefa concluida."
                    )
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <LeadTimeline events={payload.events} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo rapido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Score atual: <strong>{payload.lead.score}</strong>
            </p>
            <p>Origem: {payload.lead.source ?? "Nao informada"}</p>
            <p>Responsavel: {payload.lead.assignedTo ?? "Nao definido"}</p>
            <p>Ultima interacao: {new Date(payload.lead.lastInteractionAt ?? payload.lead.createdAt).toLocaleString("pt-BR")}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
