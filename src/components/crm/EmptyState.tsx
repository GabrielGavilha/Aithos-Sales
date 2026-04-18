import { Inbox } from "lucide-react";
import { Button } from "@/components/ui";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center">
    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600">
      <Inbox className="h-5 w-5" />
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
    {actionLabel && onAction ? (
      <Button variant="secondary" className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);
