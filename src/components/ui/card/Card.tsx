"use client";

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardVariant = "default" | "glass" | "elevated" | "outlined" | "accent";
export type CardSize = "sm" | "md" | "lg";

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  variant?: CardVariant;
  size?: CardSize;
  hoverable?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
  className?: string;
}

export interface CardHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export interface CardContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right" | "between";
}

// ─── Variant & Size Maps ──────────────────────────────────────────────────────

const variantClasses: Record<CardVariant, string> = {
  default: "bg-white border border-gray-200/60 shadow-sm hover:shadow-md",
  glass: "bg-white/70 backdrop-blur-md border border-white/50 shadow-md hover:shadow-xl",
  elevated: "bg-white border border-gray-100 shadow-md hover:shadow-xl",
  outlined:
    "bg-white border-2 border-gray-200 shadow-none hover:border-blue-300 hover:shadow-md",
  accent: "bg-gradient-to-br from-white to-slate-50 border border-blue-100 shadow-sm hover:shadow-lg",
};

const sizeClasses: Record<CardSize, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const footerAlignClasses: Record<NonNullable<CardFooterProps["align"]>, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
  between: "justify-between",
};

// ─── Card ─────────────────────────────────────────────────────────────────────

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      size = "md",
      hoverable = false,
      clickable = false,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const interactiveClasses =
      hoverable || clickable
        ? "transition-all duration-200 ease-in-out hover:scale-[1.015] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2"
        : "transition-shadow duration-200 ease-in-out";

    return (
      <div
        ref={ref}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        className={[
          "rounded-2xl w-full",
          variantClasses[variant],
          sizeClasses[size],
          interactiveClasses,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        <div className="flex flex-col gap-4">{children}</div>
      </div>
    );
  }
);

Card.displayName = "Card";

// ─── CardHeader ───────────────────────────────────────────────────────────────

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
  action,
  ...props
}) => {
  return (
    <div
      className={["flex items-start justify-between gap-4", className].filter(Boolean).join(" ")}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

CardHeader.displayName = "CardHeader";

// ─── CardContent ──────────────────────────────────────────────────────────────

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={["text-sm text-gray-600 leading-relaxed space-y-3", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};

CardContent.displayName = "CardContent";

// ─── CardFooter ───────────────────────────────────────────────────────────────

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
  align = "right",
  ...props
}) => {
  return (
    <div
      className={[
        "flex items-center gap-3 pt-2 border-t border-gray-100",
        footerAlignClasses[align],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};

CardFooter.displayName = "CardFooter";

// ─── Usage Example ────────────────────────────────────────────────────────────

const Badge: React.FC<{ label: string; color?: string }> = ({
  label,
  color = "bg-emerald-100 text-emerald-700",
}) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
    {label}
  </span>
);

const Avatar: React.FC<{ initials: string; color?: string }> = ({
  initials,
  color = "bg-blue-500",
}) => (
  <div
    className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
  >
    {initials}
  </div>
);

export const CardExamples: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-8 md:p-12 font-sans">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
            Aithos Sales · Design System
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Card Component</h1>
          <p className="text-sm text-gray-500">
            Componente reutilizável · 5 variantes · Composição modular
          </p>
        </div>

        {/* Grid — variant showcase */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Default */}
          <Card variant="default" hoverable>
            <CardHeader action={<Badge label="Ativo" />}>
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                Oportunidade
              </p>
              <h3 className="text-lg font-semibold leading-tight text-gray-900">
                Renovação Enterprise — Q3
              </h3>
            </CardHeader>
            <CardContent>
              <p>
                Contrato de renovação anual com expansão de licenças para o módulo Analytics.
                Pipeline em fase de negociação final.
              </p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-3/4 rounded-full bg-blue-500" />
                </div>
                <span className="text-xs font-medium text-gray-500">75%</span>
              </div>
            </CardContent>
            <CardFooter align="between">
              <div className="flex items-center gap-2">
                <Avatar initials="RS" color="bg-violet-500" />
                <span className="text-xs text-gray-500">Rafael S.</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">R$ 84.000</span>
            </CardFooter>
          </Card>

          {/* Glass */}
          <Card variant="glass" hoverable>
            <CardHeader action={<Badge label="Novo" color="bg-blue-100 text-blue-700" />}>
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                Lead Inbound
              </p>
              <h3 className="text-lg font-semibold leading-tight text-gray-900">
                Fintech Horizonte SA
              </h3>
            </CardHeader>
            <CardContent>
              <p>
                Empresa de médio porte interessada na suite completa. Primeiro contato realizado
                via formulário de demonstração no site.
              </p>
            </CardContent>
            <CardFooter align="between">
              <div className="flex -space-x-2">
                <Avatar initials="AM" color="bg-pink-500" />
                <Avatar initials="JC" color="bg-amber-500" />
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800"
              >
                Ver detalhes →
              </button>
            </CardFooter>
          </Card>

          {/* Elevated */}
          <Card variant="elevated" hoverable>
            <CardHeader action={<Badge label="Urgente" color="bg-rose-100 text-rose-700" />}>
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                Tarefa
              </p>
              <h3 className="text-lg font-semibold leading-tight text-gray-900">
                Follow-up Proposta Acme Corp
              </h3>
            </CardHeader>
            <CardContent>
              <p>
                Enviar proposta revisada com desconto de 15% para fechamento até sexta-feira.
                Contato: Fernanda Lima.
              </p>
            </CardContent>
            <CardFooter align="between">
              <span className="text-xs font-medium text-rose-500">Vence em 2 dias</span>
              <button
                type="button"
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700"
              >
                Concluir
              </button>
            </CardFooter>
          </Card>

          {/* Outlined */}
          <Card variant="outlined" hoverable>
            <CardHeader>
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                Métrica
              </p>
              <h3 className="text-lg font-semibold leading-tight text-gray-900">
                Receita Mensal Recorrente
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold tracking-tight text-gray-900">
                  R$ 312.400
                  <span className="ml-2 text-sm font-normal text-emerald-500">+8,4%</span>
                </p>
                <p className="text-xs text-gray-400">vs. mês anterior · Atualizado agora</p>
              </div>
            </CardContent>
          </Card>

          {/* Accent */}
          <Card variant="accent" hoverable>
            <CardHeader action={<Badge label="Pro" color="bg-indigo-100 text-indigo-700" />}>
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                Cliente
              </p>
              <h3 className="text-lg font-semibold leading-tight text-gray-900">Grupo Vanguard</h3>
            </CardHeader>
            <CardContent>
              <p>
                Cliente desde 2021. Contrato Enterprise com SLA premium e suporte dedicado. NPS:
                92.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge label="Enterprise" color="bg-slate-100 text-slate-600" />
                <Badge label="SLA Premium" color="bg-indigo-50 text-indigo-600" />
              </div>
            </CardContent>
            <CardFooter align="between">
              <span className="text-xs text-gray-400">Próx. revisão: Jun 2025</span>
              <Avatar initials="MV" color="bg-indigo-500" />
            </CardFooter>
          </Card>

          {/* Clickable CTA */}
          <Card
            variant="elevated"
            clickable
            hoverable
            className="border-2 border-dashed border-blue-200 bg-blue-50/30 hover:border-blue-400"
            onClick={() => alert("Nova oportunidade criada!")}
          >
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-600">
                +
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Nova Oportunidade</p>
                <p className="mt-0.5 text-xs text-gray-400">Clique para adicionar</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Size showcase */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Tamanhos
          </h2>
          <div className="flex max-w-md flex-col gap-3">
            {(["sm", "md", "lg"] as const).map((size) => (
              <Card key={size} size={size} variant="default">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-800">Card size="{size}"</h3>
                </CardHeader>
                <CardContent>
                  <p>
                    Exemplo com padding da escala{" "}
                    <code className="font-mono text-xs text-blue-600">{size}</code>.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardExamples;
