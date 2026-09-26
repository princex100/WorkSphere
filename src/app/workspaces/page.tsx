"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspaces } from "@/hooks/workspace/useWorkspaces";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";

export default function WorkspaceSelectionPage() {
  const router = useRouter();
  const { data: workspaces, isLoading, isError, error, refetch } = useWorkspaces();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] font-sans flex flex-col">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-neutral-200/80 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-neutral-900 text-white font-bold text-xs">
              WS
            </div>
            <span className="font-semibold text-sm tracking-tight text-neutral-900">
              WorkSphere
            </span>
          </Link>
          <span className="text-xs text-neutral-400 font-medium">Workspace Selector</span>
        </div>
      </header>

      {/* ── Main Workspace List Content ────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-14">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
            Select a Workspace
          </h1>
          <p className="text-sm text-neutral-500">
            Choose a workspace to continue to your projects, tasks, and vault.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <ErrorState
            title="Failed to load workspaces"
            description="We couldn't retrieve your workspaces. Please try again."
            onRetry={() => refetch()}
          />
        )}

        {/* Empty State */}
        {!isLoading && !isError && workspaces?.length === 0 && (
          <EmptyState
            title="No Workspaces Found"
            description="Your personal workspace is being prepared or has not been created yet."
            action={{
              label: "Back to Home",
              onClick: () => router.push("/"),
            }}
          />
        )}

        {/* Workspaces Grid */}
        {!isLoading && !isError && workspaces && workspaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {workspaces.map((ws: any) => (
              <div
                key={ws.id}
                onClick={() => router.push(`/dashboard`)}
                className="group relative cursor-pointer rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs hover:border-neutral-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-neutral-900 text-white font-bold text-base shadow-xs">
                    {ws.name?.[0]?.toUpperCase() || "W"}
                  </div>
                  {ws.is_personal && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                      Personal
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-neutral-900 group-hover:text-neutral-900 transition-colors">
                  {ws.name}
                </h2>
                <p className="mt-1 text-xs text-neutral-400 font-mono">
                  slug: {ws.slug}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <span className="text-xs text-neutral-500 font-medium">
                    Role: <span className="capitalize text-neutral-900">{ws.role || "Owner"}</span>
                  </span>
                  <span className="text-xs font-medium text-neutral-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Open Workspace →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
