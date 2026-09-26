"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserWorkspaces, getCurrentWorkspace, getDashboard } from "@/lib/api/workspace.api";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: getUserWorkspaces,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurrentWorkspace() {
  return useQuery({
    queryKey: ["workspace", "current"],
    queryFn: getCurrentWorkspace,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    staleTime: 2 * 60 * 1000,
  });
}
