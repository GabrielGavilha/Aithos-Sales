"use client";

import * as React from "react";
import type { Lead, LeadsFilterState } from "@/types";

const defaultFilterState: LeadsFilterState = {
  query: "",
  stageId: "all",
  source: "all",
  priority: "all",
  budgetRange: "all",
  noFollowUpDays: 0,
  sortBy: "recent",
  sortDirection: "desc"
};

const inBudget = (lead: Lead, range: LeadsFilterState["budgetRange"]) => {
  const value = lead.budget ?? 0;
  if (range === "all") return true;
  if (range === "0-2000") return value <= 2000;
  if (range === "2000-10000") return value > 2000 && value <= 10000;
  return value > 10000;
};

export const useLeadFilters = (initialLeads: Lead[]) => {
  const [filters, setFilters] = React.useState<LeadsFilterState>(defaultFilterState);

  const filteredLeads = React.useMemo(() => {
    const now = Date.now();
    const query = filters.query.trim().toLowerCase();

    const filtered = initialLeads.filter((lead) => {
      if (filters.stageId !== "all" && lead.stageId !== filters.stageId) return false;
      if (filters.source !== "all" && lead.source !== filters.source) return false;
      if (filters.priority !== "all" && lead.priority !== filters.priority) return false;
      if (!inBudget(lead, filters.budgetRange)) return false;
      if (filters.noFollowUpDays > 0) {
        const reference = lead.lastInteractionAt ?? lead.createdAt;
        const idleDays = (now - new Date(reference).getTime()) / (1000 * 60 * 60 * 24);
        if (idleDays < filters.noFollowUpDays) return false;
      }
      if (query.length > 0) {
        const haystack = `${lead.name} ${lead.company ?? ""} ${lead.phone}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (filters.sortBy === "recent") {
        const diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        return filters.sortDirection === "asc" ? diff : -diff;
      }

      if (filters.sortBy === "priority") {
        const priorityRank = { low: 1, medium: 2, high: 3 };
        const diff = priorityRank[a.priority] - priorityRank[b.priority];
        return filters.sortDirection === "asc" ? diff : -diff;
      }

      const lastA = new Date(a.lastInteractionAt ?? a.createdAt).getTime();
      const lastB = new Date(b.lastInteractionAt ?? b.createdAt).getTime();
      const diff = lastA - lastB;
      return filters.sortDirection === "asc" ? diff : -diff;
    });

    return filtered;
  }, [filters, initialLeads]);

  return {
    filters,
    setFilters,
    filteredLeads,
    resetFilters: () => setFilters(defaultFilterState)
  };
};
