import { MessageCircle, Phone } from "lucide-react";
import { PriorityBadge } from "@/components/crm/PriorityBadge";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { TagBadge } from "@/components/crm/TagBadge";
import { Button, Card, CardContent } from "@/components/ui";
import type { Lead } from "@/types";

export const LeadHeader = ({ lead }: { lead: Lead }) => (
  <Card className="p-0">
    <CardContent className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{lead.name}</h2>
          <p className="text-sm text-slate-500">{lead.company ?? "Sem empresa"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={lead.status} />
          <PriorityBadge value={lead.priority} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {lead.tags.length > 0 ? lead.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />) : <p className="text-sm text-slate-500">Sem tags</p>}
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <p className="text-slate-600">
          <span className="font-semibold text-slate-900">Telefone:</span> {lead.phone}
        </p>
        <p className="text-slate-600">
          <span className="font-semibold text-slate-900">Email:</span> {lead.email ?? "-"}
        </p>
        <p className="text-slate-600">
          <span className="font-semibold text-slate-900">Necessidade:</span> {lead.need ?? "-"}
        </p>
        <p className="text-slate-600">
          <span className="font-semibold text-slate-900">Orcamento:</span>{" "}
          {typeof lead.budget === "number" ? `R$ ${lead.budget.toLocaleString("pt-BR")}` : "-"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
          <Button size="sm">
            <MessageCircle className="h-4 w-4" />
            Abrir WhatsApp
          </Button>
        </a>
        <a href={`tel:${lead.phone.replace(/\D/g, "")}`}>
          <Button size="sm" variant="secondary">
            <Phone className="h-4 w-4" />
            Ligar
          </Button>
        </a>
      </div>
    </CardContent>
  </Card>
);
