"use client";

import * as React from "react";
import { Download } from "lucide-react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui";
import type { ExportFilterState, LeadStage } from "@/types";

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: LeadStage[];
  onExport: (filters: ExportFilterState) => Promise<void> | void;
};

const defaultFilters: ExportFilterState = {
  stageId: "all",
  status: "all",
  source: "all",
  includeCustomFields: true,
  format: "csv"
};

export const ExportDialog = ({ open, onOpenChange, stages, onExport }: ExportDialogProps) => {
  const [filters, setFilters] = React.useState<ExportFilterState>(defaultFilters);
  const [loading, setLoading] = React.useState(false);

  const runExport = async () => {
    setLoading(true);
    try {
      await onExport(filters);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar dados</DialogTitle>
          <DialogDescription>
            Selecione filtros e formato para gerar o arquivo com leads, status e historico.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Etapa</Label>
            <Select value={filters.stageId} onValueChange={(value) => setFilters((current) => ({ ...current, stageId: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas etapas</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value: ExportFilterState["status"]) =>
                  setFilters((current) => ({ ...current, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="open">Abertos</SelectItem>
                  <SelectItem value="won">Ganhos</SelectItem>
                  <SelectItem value="lost">Perdidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select
                value={filters.format}
                onValueChange={(value: ExportFilterState["format"]) =>
                  setFilters((current) => ({ ...current, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">XLSX</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox
              checked={filters.includeCustomFields}
              onCheckedChange={(checked) =>
                setFilters((current) => ({
                  ...current,
                  includeCustomFields: Boolean(checked)
                }))
              }
            />
            Incluir campos personalizados e UTM
          </label>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={runExport} disabled={loading}>
            <Download className="h-4 w-4" />
            {loading ? "Gerando..." : "Exportar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
