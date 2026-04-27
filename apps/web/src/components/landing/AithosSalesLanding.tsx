"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ButtonHTMLAttributes, DragEvent as ReactDragEvent, ReactNode, TouchEvent as ReactTouchEvent } from "react";
import clsx from "clsx";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layout,
  MessageSquare,
  Play,
  Target,
  TrendingUp,
  Users,
  X,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "large" | "small";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const buttonStyles = (variant: ButtonVariant = "primary", size: ButtonSize = "default", className?: string) =>
  clsx(
    "group inline-flex items-center justify-center gap-2 relative overflow-hidden rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-60",
    variant === "primary" &&
      "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40",
    variant === "secondary" && "border-2 border-blue-200 bg-white text-blue-600 hover:border-blue-300 hover:bg-blue-50",
    variant === "ghost" && "text-gray-600 hover:bg-blue-50 hover:text-blue-600",
    size === "default" && "px-8 py-4 text-base",
    size === "large" && "px-10 py-5 text-lg",
    size === "small" && "px-6 py-3 text-sm",
    className
  );

const Button = ({ children, variant = "primary", size = "default", className, type = "button", ...props }: ButtonProps) => (
  <button type={type} className={buttonStyles(variant, size, className)} {...props}>
    {children}
  </button>
);

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => (
  <div
    className="group rounded-2xl border border-gray-100 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 transition-transform duration-300 group-hover:scale-110">
      <Icon className="h-7 w-7 text-white" />
    </div>
    <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
    <p className="leading-relaxed text-gray-600">{description}</p>
  </div>
);

type MetricCardProps = {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
};

const MetricCard = ({ value, label, icon: Icon, color }: MetricCardProps) => (
  <div className="rounded-xl border border-gray-100 bg-white p-6 transition-shadow duration-300 hover:shadow-lg">
    <div className="mb-2 flex items-center gap-3">
      <div className={clsx("flex h-10 w-10 items-center justify-center rounded-lg", color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

type LeadStatus = "novo" | "contato" | "negociacao";

type HeroLead = {
  id: string;
  name: string;
  origin: string;
  status: LeadStatus;
  time: string;
};

const heroColumns: Array<{ status: LeadStatus; label: string; countTone: string }> = [
  { status: "novo", label: "NOVO", countTone: "bg-blue-100 text-blue-600" },
  { status: "contato", label: "CONTATO", countTone: "bg-yellow-100 text-yellow-600" },
  { status: "negociacao", label: "NEGOCIACAO", countTone: "bg-purple-100 text-purple-600" }
];

const heroEmptySlots: Record<LeadStatus, number> = {
  novo: 1,
  contato: 1,
  negociacao: 0
};

const initialHeroLeads: HeroLead[] = [
  { id: "maria", name: "Maria Silva", origin: "Instagram", status: "novo", time: "ha 5min" },
  { id: "joao", name: "Joao Santos", origin: "Site", status: "novo", time: "ha 2h" },
  { id: "ana", name: "Ana Costa", origin: "QR Code", status: "contato", time: "ha 1h" },
  { id: "pedro", name: "Pedro Lima", origin: "Indicacao", status: "negociacao", time: "ha 3h" }
];

type LeadCardProps = {
  name: string;
  origin: string;
  status: LeadStatus;
  time: string;
  motionDelayMs?: number;
  isIdleAnimated?: boolean;
  isDragging?: boolean;
  isTouchDragging?: boolean;
  isDropAnimated?: boolean;
  onDragStart?: (event: ReactDragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  onTouchStart?: (event: ReactTouchEvent<HTMLDivElement>) => void;
  onTouchMove?: (event: ReactTouchEvent<HTMLDivElement>) => void;
  onTouchEnd?: (event: ReactTouchEvent<HTMLDivElement>) => void;
  onTouchCancel?: () => void;
};

const LeadCard = ({
  name,
  origin,
  status,
  time,
  motionDelayMs = 0,
  isIdleAnimated = true,
  isDragging = false,
  isTouchDragging = false,
  isDropAnimated = false,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel
}: LeadCardProps) => {
  const statusColors: Record<LeadStatus, string> = {
    novo: "bg-blue-100 text-blue-700",
    contato: "bg-yellow-100 text-yellow-700",
    negociacao: "bg-purple-100 text-purple-700"
  };

  return (
    <div
      className={clsx(
        isIdleAnimated && "landing-card-idle",
        (isDragging || isTouchDragging) && "landing-card-idle-paused"
      )}
      style={isIdleAnimated ? { animationDelay: `${motionDelayMs}ms` } : undefined}
    >
      <div
        className={clsx(
          "cursor-grab select-none rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing",
          isDragging && "scale-[0.98] opacity-60 shadow-none",
          isTouchDragging && "scale-[0.98] opacity-60 shadow-lg shadow-blue-200/70 ring-2 ring-blue-200",
          isDropAnimated && "landing-card-drop"
        )}
        style={{ touchAction: isTouchDragging ? "none" : "pan-y" }}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-500">{origin}</p>
          </div>
          <span className={clsx("rounded-full px-3 py-1 text-xs font-medium", statusColors[status])}>{status}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
};

type VideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const VideoModal = ({ isOpen, onClose }: VideoModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 transition-colors hover:bg-white"
          aria-label="Fechar vídeo"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>
        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
          <p className="text-lg text-white">Vídeo demonstração aqui</p>
        </div>
      </div>
    </div>
  );
};

const problemCards = [
  {
    icon: AlertCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    title: "Leads esquecidos",
    description: "Você atende 1, esquece de 3. No fim do dia, já não lembra quem era quem."
  },
  {
    icon: MessageSquare,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    title: "WhatsApp bagunçado",
    description: "Conversas misturadas com amigos, família e clientes. Impossível organizar."
  },
  {
    icon: Clock,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    title: "Sem follow-up",
    description: "Sem sistema, você não sabe quando voltar a falar com cada lead."
  }
] as const;

const solutionSteps = [
  { index: "1", title: "Captura automática", description: "Crie formulários e compartilhe o link. Todo lead cai direto no seu funil." },
  { index: "2", title: "Organização visual", description: "Arraste e solte no Kanban. Veja de relance onde cada lead está no processo." },
  { index: "3", title: "Lembretes inteligentes", description: "Nunca mais esqueça de dar follow-up. O sistema avisa quando está na hora." },
  { index: "4", title: "Histórico completo", description: "Timeline de todas as interações. Volte 6 meses atrás e saiba exatamente o que aconteceu." }
] as const;

const featureCards = [
  {
    icon: Target,
    title: "Captura de Leads",
    description: "Formulários personalizados com campos customizados. Anti-duplicidade automática e rastreamento de origem.",
    delay: 0
  },
  {
    icon: Layout,
    title: "Funil Kanban",
    description: "Arraste e solte leads entre etapas: Novo → Contato → Negociação → Ganho/Perdido. Visual e intuitivo.",
    delay: 100
  },
  {
    icon: Bell,
    title: "Follow-up Inteligente",
    description: "Alertas automáticos, tarefas com prazo e identificação de leads parados. Nunca perca o timing.",
    delay: 200
  },
  {
    icon: BarChart3,
    title: "Histórico Completo",
    description: "Timeline de eventos, notas, interações e registro de ganhos/perdas. Tudo documentado.",
    delay: 300
  }
] as const;

const roadmapCurrent = [
  "Captura de leads com formulários",
  "Funil Kanban completo",
  "Histórico de interações",
  "Tarefas e lembretes",
  "Dashboard com métricas",
  "Sistema multi-usuário"
] as const;

const roadmapNext = [
  "Automações de follow-up",
  "Integração WhatsApp Business",
  "E-mail marketing integrado",
  "Relatórios avançados (PDF)",
  "App mobile (iOS/Android)",
  "Webhooks e API pública"
] as const;

const techCards = [
  { label: "Framework", value: "Next.js" },
  { label: "Database", value: "Supabase" },
  { label: "Deploy", value: "Vercel" },
  { label: "Uptime", value: "99.9%" }
] as const;

const footerColumns = {
  produto: [
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Preços", href: "#precos" },
    { label: "Demonstração", href: "#demonstracao" },
    { label: "Roadmap", href: "#roadmap" }
  ],
  recursos: [
    { label: "Blog", href: "#" },
    { label: "Tutoriais", href: "#" },
    { label: "Central de Ajuda", href: "#" },
    { label: "API Docs", href: "#" }
  ],
  empresa: [
    { label: "Sobre nós", href: "#" },
    { label: "Contato", href: "#" },
    { label: "Privacidade", href: "#" },
    { label: "Termos de uso", href: "#" }
  ]
} as const;

export const AithosSalesLanding = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [heroLeads, setHeroLeads] = useState<HeroLead[]>(initialHeroLeads);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null);
  const [touchDraggingLeadId, setTouchDraggingLeadId] = useState<string | null>(null);
  const [touchDragOverStatus, setTouchDragOverStatus] = useState<LeadStatus | null>(null);
  const [movedLeadId, setMovedLeadId] = useState<string | null>(null);

  useEffect(() => {
    if (!showVideo) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showVideo]);

  useEffect(() => {
    if (!movedLeadId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMovedLeadId(null);
    }, 260);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [movedLeadId]);

  const isLeadStatus = (value: string | undefined | null): value is LeadStatus =>
    value === "novo" || value === "contato" || value === "negociacao";

  const getStatusFromTouchPoint = (touch: { clientX: number; clientY: number }): LeadStatus | null => {
    const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
    const columnElement = target?.closest("[data-hero-column]") as HTMLElement | null;
    const statusValue = columnElement?.dataset.heroColumn;
    return isLeadStatus(statusValue) ? statusValue : null;
  };

  const moveHeroLead = (leadId: string, nextStatus: LeadStatus) => {
    let moved = false;
    setHeroLeads((currentLeads) => {
      const leadToMove = currentLeads.find((lead) => lead.id === leadId);
      if (!leadToMove || leadToMove.status === nextStatus) {
        return currentLeads;
      }

      moved = true;
      return currentLeads.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status: nextStatus
            }
          : lead
      );
    });

    if (moved) {
      setMovedLeadId(leadId);
    }
  };

  const handleHeroDragStart = (leadId: string) => (event: ReactDragEvent<HTMLDivElement>) => {
    setDraggingLeadId(leadId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", leadId);
  };

  const handleHeroDragEnd = () => {
    setDraggingLeadId(null);
    setDragOverStatus(null);
  };

  const handleHeroDragOver = (status: LeadStatus) => (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };

  const handleHeroDrop = (status: LeadStatus) => (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedLeadId = event.dataTransfer.getData("text/plain") || draggingLeadId;

    if (!droppedLeadId) {
      return;
    }

    moveHeroLead(droppedLeadId, status);
    setDraggingLeadId(null);
    setDragOverStatus(null);
  };

  const handleHeroTouchStart = (leadId: string) => (event: ReactTouchEvent<HTMLDivElement>) => {
    setTouchDraggingLeadId(leadId);
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    const hoveredStatus = getStatusFromTouchPoint(touch);
    setTouchDragOverStatus(hoveredStatus);
  };

  const handleHeroTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!touchDraggingLeadId) {
      return;
    }

    event.preventDefault();
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    const hoveredStatus = getStatusFromTouchPoint(touch);
    setTouchDragOverStatus(hoveredStatus);
  };

  const handleHeroTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!touchDraggingLeadId) {
      return;
    }

    const touch = event.changedTouches[0];
    const touchStatus = touch ? getStatusFromTouchPoint(touch) : null;
    const finalStatus = touchStatus ?? touchDragOverStatus;
    if (finalStatus) {
      moveHeroLead(touchDraggingLeadId, finalStatus);
    }

    setTouchDraggingLeadId(null);
    setTouchDragOverStatus(null);
  };

  const handleHeroTouchCancel = () => {
    setTouchDraggingLeadId(null);
    setTouchDragOverStatus(null);
  };

  const activeDragOverStatus = touchDragOverStatus ?? dragOverStatus;

  return (
    <div className="relative isolate min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#inicio" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-2xl font-bold text-transparent">
              Aithos Sales
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#funcionalidades" className="font-medium text-gray-600 transition-colors hover:text-blue-600">
              Funcionalidades
            </a>
            <a href="#demonstracao" className="font-medium text-gray-600 transition-colors hover:text-blue-600">
              Demonstração
            </a>
            <a href="#precos" className="font-medium text-gray-600 transition-colors hover:text-blue-600">
              Preços
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className={buttonStyles("ghost", "small")}>
              Entrar
            </Link>
            <Link href="/signup" className={buttonStyles("primary", "small")}>
              Testar grátis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </nav>
      </header>

      <main id="inicio">
        <section className="relative overflow-hidden px-6 pb-32 pt-20">
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute left-10 top-40 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="absolute right-20 top-60 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                  <Zap className="h-4 w-4" />
                  <span>Comece em minutos</span>
                </div>

                <h1 className="max-w-3xl text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                  Nunca mais perca vendas por falta de{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    follow-up
                  </span>
                </h1>

                <p className="max-w-2xl text-xl leading-relaxed text-gray-600">
                  Receba leads automaticamente, organize no funil Kanban e feche mais vendas com lembretes inteligentes.
                  Simples assim.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/signup" className={buttonStyles("primary", "large")}>
                    Testar grátis por 14 dias
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Button variant="secondary" size="large" onClick={() => setShowVideo(true)}>
                    <Play className="h-5 w-5" />
                    Ver demonstração
                  </Button>
                </div>

                <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Sem cartão de crédito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Configuração rápida</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl shadow-blue-500/10">
                  <div className="space-y-4">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Funil de Vendas</h3>
                      <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      {heroColumns.map((column, columnIndex) => {
                        const leadsInColumn = heroLeads.filter((lead) => lead.status === column.status);
                        const extraPlaceholders = Math.max(heroEmptySlots[column.status], leadsInColumn.length === 0 ? 1 : 0);

                        return (
                          <div
                            key={column.status}
                            data-hero-column={column.status}
                            className={clsx(
                              "space-y-2 rounded-lg border border-transparent p-1 transition-colors duration-200",
                              activeDragOverStatus === column.status && "border-blue-300 bg-blue-50/60"
                            )}
                            onDragOver={handleHeroDragOver(column.status)}
                            onDrop={handleHeroDrop(column.status)}
                            onDragLeave={() => {
                              if (dragOverStatus === column.status) {
                                setDragOverStatus(null);
                              }
                            }}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-600">{column.label}</span>
                              <span className={clsx("rounded-full px-2 py-0.5 text-xs", column.countTone)}>{leadsInColumn.length}</span>
                            </div>

                            {leadsInColumn.map((lead, leadIndex) => (
                              <LeadCard
                                key={lead.id}
                                name={lead.name}
                                origin={lead.origin}
                                status={lead.status}
                                time={lead.time}
                                motionDelayMs={(columnIndex * 3 + leadIndex) * 160}
                                isDragging={draggingLeadId === lead.id}
                                isTouchDragging={touchDraggingLeadId === lead.id}
                                isDropAnimated={movedLeadId === lead.id}
                                onDragStart={handleHeroDragStart(lead.id)}
                                onDragEnd={handleHeroDragEnd}
                                onTouchStart={handleHeroTouchStart(lead.id)}
                                onTouchMove={handleHeroTouchMove}
                                onTouchEnd={handleHeroTouchEnd}
                                onTouchCancel={handleHeroTouchCancel}
                              />
                            ))}

                            {Array.from({ length: extraPlaceholders }).map((_, index) => (
                              <div
                                key={`${column.status}-placeholder-${index}`}
                                className={clsx(
                                  "h-20 rounded-lg border-2 border-dashed transition-colors duration-200",
                                  activeDragOverStatus === column.status
                                    ? "border-blue-300 bg-blue-100/30"
                                    : "border-gray-200 bg-transparent"
                                )}
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 -top-4 animate-bounce rounded-xl bg-green-500 px-4 py-2 text-white shadow-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm font-semibold">Novo lead!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-gray-50 to-white px-6 py-24">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">Você está perdendo dinheiro e nem sabe</h2>
            <p className="mx-auto mb-16 max-w-3xl text-xl text-gray-600">
              Todo dia, leads chegam pelo Instagram, site ou QR code... e simplesmente desaparecem no WhatsApp.
            </p>

            <div className="grid gap-8 md:grid-cols-3">
              {problemCards.map(({ icon: Icon, iconBg, iconColor, title, description }) => (
                <div key={title} className="rounded-2xl border border-gray-100 bg-white p-8 transition-shadow hover:shadow-xl">
                  <div className={clsx("mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl", iconBg)}>
                    <Icon className={clsx("h-8 w-8", iconColor)} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
                  <p className="text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">A solução é mais simples do que você imagina</h2>
              <p className="mx-auto max-w-3xl text-xl text-gray-600">
                Um CRM visual, automático e fácil de usar. Feito para quem vende pelo WhatsApp.
              </p>
            </div>

            <div className="grid items-center gap-12 md:grid-cols-2">
              <div className="space-y-8">
                {solutionSteps.map(({ index, title, description }) => (
                  <div key={title} className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <span className="text-xl font-bold text-blue-600">{index}</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
                      <p className="text-gray-600">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white shadow-2xl shadow-blue-500/30">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-lg font-semibold">Zero leads perdidos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-lg font-semibold">Mais vendas fechadas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-lg font-semibold">Tempo economizado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-lg font-semibold">Total controle do processo</span>
                  </div>

                  <div className="border-t border-blue-400 pt-6">
                    <p className="mb-2 text-2xl font-bold">Resultado:</p>
                    <p className="text-lg opacity-90">
                      Você fecha mais vendas em menos tempo, sem perder nenhum lead no caminho.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="bg-gradient-to-b from-white to-gray-50 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">Tudo que você precisa para vender mais</h2>
              <p className="mx-auto max-w-3xl text-xl text-gray-600">
                Funcionalidades poderosas, interface simples. Sem curva de aprendizado.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((card) => (
                <FeatureCard
                  key={card.title}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  delay={card.delay}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="demonstracao" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">Veja como é fácil usar</h2>
              <p className="mx-auto max-w-3xl text-xl text-gray-600">Interface limpa e intuitiva. Você aprende em minutos.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-500/10">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-2xl font-bold">Meu Funil de Vendas</h3>
                  <Button size="small" variant="secondary">
                    + Novo Lead
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-bold text-gray-900">Novo</h4>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-600">5</span>
                    </div>
                    <div className="space-y-3">
                      <div className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 p-4 transition-shadow hover:shadow-md">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">Carla Mendes</p>
                            <p className="text-sm text-gray-500">Instagram</p>
                          </div>
                          <span className="text-xs text-gray-400">há 10min</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-600">Abrir WhatsApp</span>
                        </div>
                      </div>

                      <div className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-4 transition-shadow hover:shadow-md">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">Roberto Alves</p>
                            <p className="text-sm text-gray-500">Site</p>
                          </div>
                          <span className="text-xs text-gray-400">há 2h</span>
                        </div>
                      </div>

                      <div className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-4 transition-shadow hover:shadow-md">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">Juliana Souza</p>
                            <p className="text-sm text-gray-500">QR Code</p>
                          </div>
                          <span className="text-xs text-gray-400">há 4h</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-bold text-gray-900">Contato</h4>
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-600">3</span>
                    </div>
                    <div className="space-y-3">
                      <div className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-4 transition-shadow hover:shadow-md">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">Lucas Martins</p>
                            <p className="text-sm text-gray-500">Indicação</p>
                          </div>
                          <span className="text-xs text-gray-400">há 1d</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-bold text-gray-900">Negociação</h4>
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-600">2</span>
                    </div>
                    <div className="space-y-3">
                      <div className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-4 transition-shadow hover:shadow-md">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">Fernanda Costa</p>
                            <p className="text-sm text-gray-500">Tráfego Pago</p>
                          </div>
                          <span className="text-xs text-gray-400">há 2d</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1">
                          <Bell className="h-3 w-3 text-orange-500" />
                          <span className="text-xs font-medium text-orange-600">Follow-up hoje</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-bold text-gray-900">Ganho</h4>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">8</span>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">Paulo Ribeiro</p>
                            <p className="text-sm text-gray-500">R$ 2.500</p>
                          </div>
                          <span className="text-xs text-gray-400">há 1h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-gray-50 to-white px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">Tome decisões baseadas em dados</h2>
              <p className="mx-auto max-w-3xl text-xl text-gray-600">Dashboard completo para você entender seu processo de vendas.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard value="127" label="Leads capturados este mês" icon={Users} color="bg-blue-500" />
              <MetricCard value="34%" label="Taxa de conversão" icon={TrendingUp} color="bg-green-500" />
              <MetricCard value="2.4h" label="Tempo médio até contato" icon={Clock} color="bg-purple-500" />
              <MetricCard value="12" label="Leads parados há +3 dias" icon={AlertCircle} color="bg-orange-500" />
            </div>

            <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
              <h3 className="mb-6 text-xl font-bold text-gray-900">Principais motivos de perda</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-gray-700">Preço alto</span>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-full max-w-xs rounded-full bg-gray-200 sm:w-64">
                      <div className="h-3 rounded-full bg-red-500" style={{ width: "65%" }} />
                    </div>
                    <span className="w-12 text-sm font-semibold text-gray-900">65%</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-gray-700">Não respondeu</span>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-full max-w-xs rounded-full bg-gray-200 sm:w-64">
                      <div className="h-3 rounded-full bg-orange-500" style={{ width: "25%" }} />
                    </div>
                    <span className="w-12 text-sm font-semibold text-gray-900">25%</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-gray-700">Comprou concorrente</span>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-full max-w-xs rounded-full bg-gray-200 sm:w-64">
                      <div className="h-3 rounded-full bg-yellow-500" style={{ width: "10%" }} />
                    </div>
                    <span className="w-12 text-sm font-semibold text-gray-900">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-24 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-4xl font-bold sm:text-5xl">Simples, mas poderoso</h2>
                <p className="mb-8 text-xl text-blue-100">
                  Outros CRMs são complexos demais. O Aithos Sales foi feito para quem precisa vender, não para
                  especialistas em software.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0" />
                    <div>
                      <h4 className="text-lg font-semibold">Implementação em minutos</h4>
                      <p className="text-blue-100">Configure tudo em uma tarde. Não precisa de treinamento.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0" />
                    <div>
                      <h4 className="text-lg font-semibold">Interface visual</h4>
                      <p className="text-blue-100">Kanban claro e objetivo. Você entende tudo de uma olhada.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0" />
                    <div>
                      <h4 className="text-lg font-semibold">Foco em resultado</h4>
                      <p className="text-blue-100">Não tem recurso inútil. Só o essencial para você vender mais.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
                <h3 className="mb-6 text-2xl font-bold">Tecnologia de ponta</h3>
                <div className="grid grid-cols-2 gap-4">
                  {techCards.map((card) => (
                    <div key={card.label} className="rounded-xl bg-white/5 p-4 text-center">
                      <p className="mb-1 text-sm text-blue-100">{card.label}</p>
                      <p className="text-lg font-bold">{card.value}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-center text-sm text-blue-100">Sistema em nuvem, escalável e seguro</p>
              </div>
            </div>
          </div>
        </section>

        <section id="roadmap" className="bg-gradient-to-b from-white to-gray-50 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">Evolução contínua</h2>
              <p className="mx-auto max-w-3xl text-xl text-gray-600">O que está funcionando hoje e o que vem pela frente.</p>
            </div>

            <div className="space-y-8">
              <div className="relative rounded-2xl border-2 border-green-500 bg-white p-8 shadow-lg">
                <div className="absolute -top-3 left-8 rounded-full bg-green-500 px-4 py-1 text-sm font-semibold text-white">
                  ✓ Disponível agora
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">MVP Funcional</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {roadmapCurrent.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative rounded-2xl border border-blue-200 bg-white p-8 shadow-lg">
                <div className="absolute -top-3 left-8 rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white">
                  Em desenvolvimento
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">Próximas funcionalidades</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {roadmapNext.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="precos" className="relative overflow-hidden px-6 py-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600 to-blue-800" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          </div>

          <div className="mx-auto max-w-4xl text-center text-white">
            <h2 className="mb-6 text-4xl font-bold sm:text-5xl">Pronto para parar de perder vendas?</h2>
            <p className="mb-12 text-xl text-blue-100 sm:text-2xl">
              Teste grátis por 14 dias. Sem cartão de crédito. Cancele quando quiser.
            </p>

            <div className="mb-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-10 py-5 text-lg font-semibold text-blue-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Começar agora grátis
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#demonstracao"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-10 py-5 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/10"
              >
                Agendar demonstração
                <Calendar className="h-5 w-5" />
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>14 dias grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Sem cartão</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Configuração em minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Suporte dedicado</span>
              </div>
            </div>
          </div>
        </section>

      <footer className="bg-gray-900 px-6 py-12 text-gray-400">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Aithos Sales</span>
              </div>
              <p className="text-sm">CRM simples e poderoso para pequenos negócios que vendem pelo WhatsApp.</p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Produto</h4>
              <ul className="space-y-2 text-sm">
                {footerColumns.produto.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="transition-colors hover:text-white">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Recursos</h4>
              <ul className="space-y-2 text-sm">
                {footerColumns.recursos.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="transition-colors hover:text-white">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-white">Empresa</h4>
              <ul className="space-y-2 text-sm">
                {footerColumns.empresa.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="transition-colors hover:text-white">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 md:flex-row">
            <p className="text-sm">© 2026 Aithos Sales. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="https://www.instagram.com/aithostech/?theme=dark" target="blank" className="transition-colors hover:text-white">
                Instagram
              </a>
              <a href="#" className="transition-colors hover:text-white">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
      </main>

      <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} />
    </div>
  );
};


