import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { PipelineColumn } from "@/types";

type KanbanColumnProps = {
  column: PipelineColumn;
  children: ReactNode;
};

const toneByStageKey = (key: string) => {
  const normalized = key.toLowerCase();
  if (normalized.includes("ganho")) return "border-t-emerald-500";
  if (normalized.includes("perdido")) return "border-t-rose-500";
  if (normalized.includes("negoci")) return "border-t-amber-500";
  if (normalized.includes("contato")) return "border-t-cyan-500";
  return "border-t-blue-500";
};

export const KanbanColumn = ({ column, children }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.stageId
  });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-[540px] flex-col rounded-2xl border border-blue-100 bg-white/70 p-3 transition-colors",
        "border-t-4",
        toneByStageKey(column.stageId),
        isOver && "ring-2 ring-blue-300/60"
      )}
    >
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">{column.name}</h3>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
          {column.count}
        </span>
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
};
