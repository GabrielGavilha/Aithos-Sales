import { Badge } from "@/components/ui";
import type { Tag } from "@/types";

const toneMap: Record<NonNullable<Tag["tone"]>, "default" | "warning" | "danger" | "success" | "secondary"> = {
  default: "default",
  hot: "danger",
  warning: "warning",
  success: "success",
  danger: "danger"
};

export const TagBadge = ({ tag }: { tag: Tag }) => {
  const variant = toneMap[tag.tone ?? "default"];
  return <Badge variant={variant}>{tag.label}</Badge>;
};
