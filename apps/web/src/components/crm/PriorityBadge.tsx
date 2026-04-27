import type { ReactNode } from "react";
import { AlertTriangle, Flame, Minus } from "lucide-react";
import { Badge } from "@/components/ui";
import type { PriorityLevel } from "@/types";

const config: Record<PriorityLevel, { label: string; variant: "secondary" | "warning" | "danger"; icon: ReactNode }> = {
  low: { label: "Baixa", variant: "secondary", icon: <Minus className="h-3 w-3" /> },
  medium: { label: "Media", variant: "warning", icon: <AlertTriangle className="h-3 w-3" /> },
  high: { label: "Alta", variant: "danger", icon: <Flame className="h-3 w-3" /> }
};

export const PriorityBadge = ({ value }: { value: PriorityLevel }) => {
  const current = config[value];
  return (
    <Badge variant={current.variant} className="gap-1">
      {current.icon}
      {current.label}
    </Badge>
  );
};
