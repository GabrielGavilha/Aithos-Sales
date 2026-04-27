import { Badge } from "@/components/ui";
import type { LeadStatus } from "@/types";

const config: Record<LeadStatus, { label: string; variant: "default" | "success" | "danger" }> = {
  open: { label: "Aberto", variant: "default" },
  won: { label: "Ganho", variant: "success" },
  lost: { label: "Perdido", variant: "danger" }
};

export const StatusBadge = ({ status }: { status: LeadStatus }) => {
  const current = config[status];
  return <Badge variant={current.variant}>{current.label}</Badge>;
};
