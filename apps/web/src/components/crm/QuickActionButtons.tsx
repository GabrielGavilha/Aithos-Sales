import Link from "next/link";
import { Download, FilePlus2, Kanban, Plus, UserRoundSearch } from "lucide-react";
import { Button } from "@/components/ui";

export const QuickActionButtons = () => (
  <div className="flex flex-wrap gap-2">
    <Link href="/app/leads">
      <Button size="sm" variant="secondary">
        <UserRoundSearch className="h-4 w-4" />
        Leads
      </Button>
    </Link>
    <Link href="/app/pipeline">
      <Button size="sm" variant="secondary">
        <Kanban className="h-4 w-4" />
        Funil
      </Button>
    </Link>
    <Link href="/app/forms">
      <Button size="sm" variant="secondary">
        <FilePlus2 className="h-4 w-4" />
        Formulario
      </Button>
    </Link>
    <Link href="/app/export">
      <Button size="sm" variant="secondary">
        <Download className="h-4 w-4" />
        Exportar
      </Button>
    </Link>
    <Link href="/app/leads?new=1">
      <Button size="sm">
        <Plus className="h-4 w-4" />
        Novo lead
      </Button>
    </Link>
  </div>
);
