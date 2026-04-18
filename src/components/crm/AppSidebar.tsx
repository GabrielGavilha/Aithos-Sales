"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  BarChart3,
  Download,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  ListTodo,
  Settings,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export const appSidebarItems: SidebarItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/leads", label: "Leads", icon: Users },
  { href: "/app/pipeline", label: "Kanban", icon: KanbanSquare },
  { href: "/app/tasks", label: "Tarefas", icon: ListTodo },
  { href: "/app/forms", label: "Formularios", icon: FileText },
  { href: "/app/metrics", label: "Metricas", icon: BarChart3 },
  { href: "/app/export", label: "Exportacao", icon: Download },
  { href: "/app/settings", label: "Configuracoes", icon: Settings }
];

type AppSidebarProps = {
  workspaceName?: string;
  compact?: boolean;
};

export const AppSidebar = ({ workspaceName, compact = false }: AppSidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className={cn("rounded-2xl border border-blue-100 bg-white/85 p-4 shadow-lg backdrop-blur", compact && "p-3")}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-base font-bold text-white">
          A
        </div>
        {!compact ? (
          <div>
            <p className="text-sm font-semibold text-slate-900">Aithos Sales</p>
            <p className="text-xs text-slate-500">{workspaceName ?? "Workspace"}</p>
          </div>
        ) : null}
      </div>

      <nav className="space-y-1.5">
        {appSidebarItems.map((item) => {
          const isActive = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700",
                isActive && "bg-blue-600 text-white hover:bg-blue-600 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {!compact ? item.label : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
