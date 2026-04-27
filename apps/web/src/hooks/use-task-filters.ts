"use client";

import * as React from "react";
import type { Task, TasksFilterState } from "@/types";

const initialState: TasksFilterState = {
  status: "all",
  leadId: "all",
  assignee: "all"
};

export const useTaskFilters = (tasks: Task[]) => {
  const [filters, setFilters] = React.useState<TasksFilterState>(initialState);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status !== "all" && task.status !== filters.status) return false;
      if (filters.leadId !== "all" && task.leadId !== filters.leadId) return false;
      if (filters.assignee !== "all" && task.assignee !== filters.assignee) return false;
      return true;
    });
  }, [filters, tasks]);

  return {
    filters,
    setFilters,
    filteredTasks,
    resetFilters: () => setFilters(initialState)
  };
};
