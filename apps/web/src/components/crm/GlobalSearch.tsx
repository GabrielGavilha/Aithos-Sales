"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui";
import type { Lead } from "@/types";

type GlobalSearchProps = {
  leads?: Lead[];
};

export const GlobalSearch = ({ leads = [] }: GlobalSearchProps) => {
  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return leads.filter((lead) => `${lead.name} ${lead.company ?? ""}`.toLowerCase().includes(q)).slice(0, 5);
  }, [leads, query]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={query}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        onChange={(event) => setQuery(event.target.value)}
        className="pl-9"
        placeholder="Busca global por lead, empresa ou contato"
      />
      {focused && results.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-xl border border-blue-100 bg-white p-2 shadow-lg">
          {results.map((lead) => (
            <Link
              key={lead.id}
              href={`/app/leads/${lead.id}`}
              className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-blue-50"
            >
              <p className="font-semibold text-slate-900">{lead.name}</p>
              <p className="text-xs text-slate-500">{lead.company ?? "Sem empresa"}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
};
