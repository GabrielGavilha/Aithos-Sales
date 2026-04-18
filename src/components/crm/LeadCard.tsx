import Link from "next/link";
import { Clock3, MessageCircle, NotebookPen } from "lucide-react";
import { PriorityBadge } from "@/components/crm/PriorityBadge";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { TagBadge } from "@/components/crm/TagBadge";
import { Button, Card, CardContent } from "@/components/ui";
import type { Lead } from "@/types";

type LeadCardProps = {
  lead: Lead;
  compact?: boolean;
  onClick?: () => void;
  showActions?: boolean;
};

export const LeadCard = ({ lead, compact = false, onClick, showActions = true }: LeadCardProps) => {
  const interactionRef = lead.lastInteractionAt ?? lead.createdAt;
  const daysWithoutFollowUp = Math.floor((Date.now() - new Date(interactionRef).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onClick} className="text-left">
            <p className="text-base font-semibold text-slate-900">{lead.name}</p>
            <p className="text-sm text-slate-500">{lead.company ?? "Sem empresa"}</p>
          </button>
          <StatusBadge status={lead.status} />
        </div>

        <div className="flex flex-wrap gap-2">
          <PriorityBadge value={lead.priority} />
          {lead.tags.slice(0, compact ? 1 : 3).map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>

        <div className="grid gap-2 text-xs text-slate-500">
          <p>Origem: {lead.source ?? "Nao informado"}</p>
          <p>Score: {lead.score}</p>
          <p className={daysWithoutFollowUp >= 3 ? "font-semibold text-amber-700" : ""}>
            {daysWithoutFollowUp} dia(s) sem follow-up
          </p>
          {lead.nextTaskAt ? (
            <p className="inline-flex items-center gap-1 text-amber-700">
              <Clock3 className="h-3.5 w-3.5" />
              Proxima tarefa: {new Date(lead.nextTaskAt).toLocaleString("pt-BR")}
            </p>
          ) : null}
        </div>

        {showActions ? (
          <div className="flex flex-wrap gap-2">
            <Link href={`/app/leads/${lead.id}`}>
              <Button size="sm" variant="secondary">
                Ver lead
              </Button>
            </Link>
            <a
              href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-blue-200 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-50"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
            <button className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-blue-200 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-50">
              <NotebookPen className="h-3.5 w-3.5" />
              Nota
            </button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
