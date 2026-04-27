"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { ExportDialog } from "@/components/crm";
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from "@/components/ui";
import type { ExportFilterState, LeadStage } from "@/types";

type ExportScreenProps = {
  workspaceId: string;
  stages: LeadStage[];
};

export const ExportScreen = ({ workspaceId, stages }: ExportScreenProps) => {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const exportData = async (filters: ExportFilterState) => {
    if (filters.format !== "csv") {
      toast({
        title: "Formato em roadmap",
        description: "No momento, o exportador gera CSV.",
        variant: "warning"
      });
    }

    const response = await fetch(`/api/exports/leads?workspaceId=${workspaceId}`);
    if (!response.ok) {
      toast({
        title: "Falha ao exportar",
        description: "Nao foi possivel gerar o arquivo.",
        variant: "destructive"
      });
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `leads-${workspaceId}.${filters.format === "json" ? "json" : "csv"}`;
    anchor.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exportacao concluida",
      description: "Arquivo gerado com sucesso.",
      variant: "success"
    });
  };

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exportacao de dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Exporte leads, status, datas de mudanca, motivos de perda, origem/UTM e campos personalizados.
          </p>
          <Button onClick={() => setOpen(true)}>
            <Download className="h-4 w-4" />
            Iniciar exportacao
          </Button>
        </CardContent>
      </Card>

      <ExportDialog open={open} onOpenChange={setOpen} stages={stages} onExport={exportData} />
    </section>
  );
};
