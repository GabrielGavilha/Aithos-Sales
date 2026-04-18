import type { DragEvent } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Calendar, CircleDollarSign, Clock, TrendingUp } from "lucide-react";
import clsx from "clsx";
import type { SaleCard as SaleCardType, Status } from "../types/kanban";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
});

const priorityStyles: Record<SaleCardType["prioridade"], string> = {
  baixa: "bg-slate-100 text-slate-700 border-slate-200",
  media: "bg-blue-100 text-blue-700 border-blue-200",
  alta: "bg-amber-100 text-amber-700 border-amber-200",
  urgente: "bg-rose-100 text-rose-700 border-rose-200",
};

const priorityLabel: Record<SaleCardType["prioridade"], string> = {
  baixa: "Baixa",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

const originLabel: Record<SaleCardType["origem"], string> = {
  instagram: "Instagram",
  site: "Site",
  "trafego-pago": "Trafego Pago",
  "qr-code": "QR Code",
  indicacao: "Indicacao",
  whatsapp: "WhatsApp",
  organico: "Organico",
  linkedin: "LinkedIn",
  email: "E-mail",
};

const formatDate = (rawDate?: string) => {
  if (!rawDate) {
    return "Sem data";
  }

  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Data invalida";
  }

  return dateFormatter.format(parsedDate);
};

export type SaleCardProps = {
  card: SaleCardType;
  isActive: boolean;
  onDragStart: (
    event: DragEvent<HTMLElement>,
    cardId: string,
    status: Status
  ) => void;
  onDragEnd: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
};

const MotionCard = motion(Card);

export const SaleCard = ({
  card,
  isActive,
  onDragStart,
  onDragEnd,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = true,
  canMoveRight = true,
}: SaleCardProps) => {
  const isFollowupOverdue = Boolean(
    card.proximoFollowupEm && new Date(card.proximoFollowupEm).getTime() < Date.now()
  );
  const isStuck = card.diasParado >= 3;

  return (
    <MotionCard
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.2 }}
      draggable
      role="listitem"
      tabIndex={0}
      onDragStartCapture={(event: DragEvent<HTMLElement>) =>
        onDragStart(event, card.id, card.etapa)
      }
      onDragEndCapture={onDragEnd}
      className={clsx(
        "group app-lead-card min-h-[250px] rounded-2xl p-4 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500/40",
        { "ring-2 ring-blue-500/40": isActive }
      )}
      aria-label={`Lead ${card.nome}`}
    >
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 p-0">
        <div>
          <p className="truncate text-base font-semibold text-slate-900 transition group-hover:text-slate-950">
            {card.nome}
          </p>
          {card.empresa && <p className="truncate text-sm text-slate-500">{card.empresa}</p>}
        </div>
        <span
          className={clsx(
            "rounded-full border px-2.5 py-1 text-xs font-semibold",
            priorityStyles[card.prioridade]
          )}
        >
          {priorityLabel[card.prioridade]}
        </span>
      </CardHeader>

      <CardContent className="space-y-3 p-0 pt-1">
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {card.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 text-xs text-slate-600"
              >
                {tag}
              </span>
            ))}
            {card.tags.length > 2 && (
              <span className="rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 text-xs text-slate-600">
                +{card.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
            <span>{originLabel[card.origem]}</span>
          </div>

          {typeof card.orcamento === "number" && (
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-3.5 w-3.5" aria-hidden />
              <span className="font-medium text-slate-700">
                {currencyFormatter.format(card.orcamento)}
              </span>
            </div>
          )}

          {card.ultimoContatoEm && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              <span>Ultimo contato: {formatDate(card.ultimoContatoEm)}</span>
            </div>
          )}
        </div>

        {isStuck && (
          <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-2 text-xs text-orange-700">
            <AlertCircle className="h-4 w-4" aria-hidden />
            <span>Parado ha {card.diasParado} dias</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-between gap-2 border-t border-slate-100 px-0 pb-0 pt-3 text-xs text-slate-500">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
            {card.vendedor.initials}
          </div>
          <p className="truncate text-xs text-slate-600">{card.vendedor.name}</p>
        </div>

        <div className="flex items-center gap-2">
          {card.proximoFollowupEm && (
            <div
              className={clsx("flex items-center gap-1", {
                "font-semibold text-rose-600": isFollowupOverdue,
              })}
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              <span>{formatDate(card.proximoFollowupEm)}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onMoveLeft}
            disabled={!canMoveLeft}
            className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Mover para coluna anterior"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={onMoveRight}
            disabled={!canMoveRight}
            className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Mover para proxima coluna"
          >
            &rarr;
          </button>
        </div>
      </CardFooter>
    </MotionCard>
  );
};
