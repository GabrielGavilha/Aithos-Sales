import type { Dispatch, SetStateAction } from "react";
import { Search } from "lucide-react";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import type { LeadStage, LeadsFilterState } from "@/types";

type LeadFiltersProps = {
  filters: LeadsFilterState;
  setFilters: Dispatch<SetStateAction<LeadsFilterState>>;
  stages: LeadStage[];
  sources: string[];
};

export const LeadFilters = ({ filters, setFilters, stages, sources }: LeadFiltersProps) => (
  <div className="space-y-3 rounded-2xl border border-blue-100 bg-white p-4">
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        className="pl-9"
        placeholder="Buscar por nome, empresa ou contato"
        value={filters.query}
        onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
      />
    </div>

    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <Select value={filters.stageId} onValueChange={(value) => setFilters((current) => ({ ...current, stageId: value }))}>
        <SelectTrigger>
          <SelectValue placeholder="Etapa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas etapas</SelectItem>
          {stages.map((stage) => (
            <SelectItem key={stage.id} value={stage.id}>
              {stage.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.source} onValueChange={(value) => setFilters((current) => ({ ...current, source: value }))}>
        <SelectTrigger>
          <SelectValue placeholder="Origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas origens</SelectItem>
          {sources.map((source) => (
            <SelectItem key={source} value={source}>
              {source}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(value: LeadsFilterState["priority"]) =>
          setFilters((current) => ({ ...current, priority: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas prioridades</SelectItem>
          <SelectItem value="high">Alta</SelectItem>
          <SelectItem value="medium">Media</SelectItem>
          <SelectItem value="low">Baixa</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.budgetRange}
        onValueChange={(value: LeadsFilterState["budgetRange"]) =>
          setFilters((current) => ({ ...current, budgetRange: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Orcamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos orcamentos</SelectItem>
          <SelectItem value="0-2000">Ate R$ 2k</SelectItem>
          <SelectItem value="2000-10000">R$ 2k - 10k</SelectItem>
          <SelectItem value="10000+">Acima de R$ 10k</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="number"
        min={0}
        placeholder="Sem follow-up ha X dias"
        value={String(filters.noFollowUpDays || "")}
        onChange={(event) =>
          setFilters((current) => ({
            ...current,
            noFollowUpDays: Number(event.target.value || 0)
          }))
        }
      />

      <Select
        value={filters.sortBy}
        onValueChange={(value: LeadsFilterState["sortBy"]) =>
          setFilters((current) => ({ ...current, sortBy: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Mais recente</SelectItem>
          <SelectItem value="priority">Prioridade</SelectItem>
          <SelectItem value="lastInteraction">Ultima interacao</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sortDirection}
        onValueChange={(value: LeadsFilterState["sortDirection"]) =>
          setFilters((current) => ({ ...current, sortDirection: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Direcao" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Desc</SelectItem>
          <SelectItem value="asc">Asc</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);
