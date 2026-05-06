"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { MessageCircle, MoveRight, NotebookPen, X } from "lucide-react";
import * as React from "react";
import { EmptyState, LeadCard, LeadFilters, NewLeadDialog } from "@/components/crm";
import {
  Badge,
  Button,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast
} from "@/components/ui";
import { useLeadFilters } from "@/hooks/use-lead-filters";
import { useMobile } from "@/hooks/use-mobile";
import type { LeadsPayload } from "@/types";

type LeadsScreenProps = {
  workspaceId: string;
  payload: LeadsPayload;
};

export const LeadsScreen = ({ workspaceId, payload }: LeadsScreenProps) => {
  const { filters, setFilters, filteredLeads } = useLeadFilters(payload.leads);
  const isMobile = useMobile();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = React.useState(() => searchParams.get("new") === "1");

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkStageId, setBulkStageId] = React.useState("");
  const [bulkAssignee, setBulkAssignee] = React.useState("");
  const [bulkLoading, setBulkLoading] = React.useState(false);

  const allFilteredIds = filteredLeads.map((l) => l.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        allFilteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...allFilteredIds]));
    }
  };

  const clearSelection = () => setSelected(new Set());

  const runBulkAction = async (body: Record<string, unknown>, successMsg: string) => {
    setBulkLoading(true);
    try {
      const res = await fetch(`/api/leads/bulk?workspaceId=${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, leadIds: Array.from(selected) })
      });
      if (!res.ok) {
        toast({ title: "Erro na operacao", description: "Tente novamente.", variant: "destructive" });
        return;
      }
      toast({ title: "Sucesso", description: successMsg, variant: "success" });
      clearSelection();
      router.refresh();
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Leads</h2>
          <p className="text-sm text-slate-500">Busca, filtros avancados e acoes rapidas para operacao comercial.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filteredLeads.length} resultados</Badge>
          <NewLeadDialog workspaceId={workspaceId} stages={payload.stages} open={dialogOpen} onOpenChange={setDialogOpen} />
        </div>
      </div>

      <LeadFilters filters={filters} setFilters={setFilters} stages={payload.stages} sources={payload.sources} />

      {filteredLeads.length === 0 ? (
        <EmptyState
          title="Nenhum lead encontrado"
          description="Ajuste filtros ou adicione novos leads para iniciar o acompanhamento."
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Ultima interacao</TableHead>
              <TableHead>Proxima tarefa</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id} data-selected={selected.has(lead.id)} className="data-[selected=true]:bg-blue-50">
                <TableCell>
                  <Checkbox
                    checked={selected.has(lead.id)}
                    onCheckedChange={() => toggleOne(lead.id)}
                    aria-label={`Selecionar ${lead.name}`}
                  />
                </TableCell>
                <TableCell>
                  <p className="font-semibold text-slate-900">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.company ?? "Sem empresa"}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {payload.stages.find((stage) => stage.id === lead.stageId)?.name ?? "Sem etapa"}
                  </Badge>
                </TableCell>
                <TableCell>{lead.source ?? "-"}</TableCell>
                <TableCell className="capitalize">{lead.priority}</TableCell>
                <TableCell>{new Date(lead.lastInteractionAt ?? lead.createdAt).toLocaleString("pt-BR")}</TableCell>
                <TableCell>{lead.nextTaskAt ? new Date(lead.nextTaskAt).toLocaleString("pt-BR") : "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/app/leads/${lead.id}`}>
                      <Button size="sm" variant="secondary">
                        <MoveRight className="h-3.5 w-3.5" />
                        Abrir
                      </Button>
                    </Link>
                    <a
                      href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 px-2 text-blue-700 hover:bg-blue-50"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                    <button className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 px-2 text-blue-700 hover:bg-blue-50">
                      <NotebookPen className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {someSelected && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
          <span className="min-w-max text-sm font-medium text-slate-700">
            {selected.size} selecionado{selected.size > 1 ? "s" : ""}
          </span>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <Select value={bulkStageId} onValueChange={setBulkStageId}>
              <SelectTrigger className="h-8 w-40 text-sm">
                <SelectValue placeholder="Mover para etapa" />
              </SelectTrigger>
              <SelectContent>
                {payload.stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={bulkLoading || !bulkStageId}
              onClick={() => runBulkAction({ action: "move_stage", toStageId: bulkStageId }, `${selected.size} leads movidos.`)}
            >
              Mover
            </Button>
          </div>

          {payload.members.length > 0 && (
            <>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <Select value={bulkAssignee} onValueChange={setBulkAssignee}>
                  <SelectTrigger className="h-8 w-40 text-sm">
                    <SelectValue placeholder="Atribuir para" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem responsavel</SelectItem>
                    {payload.members.map((m) => (
                      <SelectItem key={m.userId} value={m.displayName}>{m.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={bulkLoading || !bulkAssignee}
                  onClick={() =>
                    runBulkAction(
                      { action: "assign", assignedTo: bulkAssignee === "__none__" ? null : bulkAssignee },
                      `${selected.size} leads atribuidos.`
                    )
                  }
                >
                  Atribuir
                </Button>
              </div>
            </>
          )}

          <div className="h-4 w-px bg-slate-200" />

          <button
            onClick={clearSelection}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Limpar selecao"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
};
