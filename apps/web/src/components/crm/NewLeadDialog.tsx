"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast
} from "@/components/ui";
import type { LeadStage } from "@/types";

type Props = {
  workspaceId: string;
  stages: LeadStage[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  company: string;
  need: string;
  budget: string;
  source: string;
  priority: "low" | "medium" | "high";
  stageId: string;
};

const empty = (stages: LeadStage[]): FormState => ({
  name: "",
  phone: "",
  email: "",
  company: "",
  need: "",
  budget: "",
  source: "",
  priority: "medium",
  stageId: stages[0]?.id ?? ""
});

export const NewLeadDialog = ({ workspaceId, stages, open: controlledOpen, onOpenChange: controlledOnOpenChange }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<FormState>(() => empty(stages));

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/leads?workspaceId=${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          company: form.company.trim() || undefined,
          need: form.need.trim() || undefined,
          budget: form.budget ? Number(form.budget) : undefined,
          source: form.source.trim() || undefined,
          priority: form.priority,
          stageId: form.stageId || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast({ title: "Erro ao criar lead", description: data.message ?? "Tente novamente.", variant: "destructive" });
        return;
      }

      toast({ title: "Lead criado", description: `${form.name} adicionado ao funil.`, variant: "success" });
      setForm(empty(stages));
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4" />
          Novo lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input placeholder="Nome completo" value={form.name} onChange={set("name")} required />
            </div>
            <div className="space-y-1">
              <Label>Telefone / WhatsApp *</Label>
              <Input placeholder="(99) 99999-9999" value={form.phone} onChange={set("phone")} required />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" placeholder="email@empresa.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="space-y-1">
              <Label>Empresa</Label>
              <Input placeholder="Nome da empresa" value={form.company} onChange={set("company")} />
            </div>
            <div className="space-y-1">
              <Label>Necessidade</Label>
              <Input placeholder="O que precisa?" value={form.need} onChange={set("need")} />
            </div>
            <div className="space-y-1">
              <Label>Orcamento (R$)</Label>
              <Input type="number" min={0} placeholder="0" value={form.budget} onChange={set("budget")} />
            </div>
            <div className="space-y-1">
              <Label>Origem</Label>
              <Input placeholder="instagram, site, indicacao..." value={form.source} onChange={set("source")} />
            </div>
            <div className="space-y-1">
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v as FormState["priority"] }))}>
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
            <Label>Etapa inicial</Label>
            <Select value={form.stageId} onValueChange={(v) => setForm((p) => ({ ...p, stageId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim() || !form.phone.trim()}>
              {saving ? "Criando..." : "Criar lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
