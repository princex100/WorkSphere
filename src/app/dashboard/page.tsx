"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/hooks/workspace/useWorkspaces";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
        <AppNavbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <SkeletonText lines={2} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div>
              <SkeletonCard />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
        <AppNavbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-16">
          <ErrorState
            title="Failed to load dashboard"
            description="We couldn't retrieve your workspace overview. Please try again."
            onRetry={() => refetch()}
          />
        </main>
      </div>
    );
  }

  const { stats, today_tasks, upcoming_tasks, projects, recent_activities, vault } = data || {
    stats: { today_tasks_count: 0, upcoming_tasks_count: 0, projects_count: 0, projects_limit: 10, is_limit_reached: false },
    today_tasks: [],
    upcoming_tasks: [],
    projects: [],
    recent_activities: [],
    vault: { is_locked: false, has_password: false, file_count: 0, link_count: 0, note_count: 0 },
  };

  const totalVaultItems = (vault?.file_count || 0) + (vault?.link_count || 0) + (vault?.note_count || 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      <AppNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* ── Welcome Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
              Welcome back, {user?.name || "Builder"} 👋
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-500">
              Here's everything happening in your personal workspace today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/projects">
              <Button
                size="sm"
                disabled={stats?.is_limit_reached}
                className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 text-xs px-4"
              >
                + New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Limit Warning Banner (if 10 projects limit reached) ───────────── */}
        {stats?.is_limit_reached && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-xs">!</span>
              <span>
                You have reached the <strong>10-project limit</strong> for Personal Workspace.
              </span>
            </div>
            <span className="text-[11px] font-medium text-amber-900 underline cursor-pointer">Learn more</span>
          </div>
        )}

        {/* ── Overview Stat Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="text-xs font-medium text-neutral-400 mb-1">Today's Tasks</div>
            <div className="text-2xl font-semibold text-neutral-900">{stats?.today_tasks_count || 0}</div>
            <div className="mt-2 text-[11px] text-neutral-500">Due before midnight</div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="text-xs font-medium text-neutral-400 mb-1">Upcoming Tasks</div>
            <div className="text-2xl font-semibold text-neutral-900">{stats?.upcoming_tasks_count || 0}</div>
            <div className="mt-2 text-[11px] text-neutral-500">Scheduled ahead</div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="text-xs font-medium text-neutral-400 mb-1">Active Projects</div>
            <div className="text-2xl font-semibold text-neutral-900">
              {stats?.projects_count || 0} <span className="text-xs font-normal text-neutral-400">/ {stats?.projects_limit || 10}</span>
            </div>
            <div className="mt-2 text-[11px] text-neutral-500">Personal Workspace Limit</div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs">
            <div className="text-xs font-medium text-neutral-400 mb-1">Personal Vault</div>
            <div className="text-2xl font-semibold text-neutral-900">{totalVaultItems}</div>
            <div className="mt-2 text-[11px] text-neutral-500">Files, Links & Notes</div>
          </div>
        </div>

        {/* ── Main Content Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Tasks Section */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-neutral-900">Today's Tasks</h2>
                <Link href="/tasks/today" className="text-xs font-medium text-neutral-500 hover:text-neutral-900">
                  View all →
                </Link>
              </div>

              {today_tasks?.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-neutral-200 rounded-xl">
                  <p className="text-xs text-neutral-500 font-medium">You're all caught up! No tasks due today.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {today_tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.status === "COMPLETED"}
                          readOnly
                          className="size-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                        />
                        <span className={`text-xs font-medium ${task.status === "COMPLETED" ? "line-through text-neutral-400" : "text-neutral-900"}`}>
                          {task.title}
                        </span>
                      </div>
                      <Badge variant={task.priority?.toLowerCase() || "default"}>
                        {task.priority || "Medium"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects Section */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">Projects</h2>
                  <span className="text-xs text-neutral-400">
                    {stats?.projects_count || 0} of {stats?.projects_limit || 10} limit used
                  </span>
                </div>
                <Link href="/projects" className="text-xs font-medium text-neutral-500 hover:text-neutral-900">
                  View all projects →
                </Link>
              </div>

              {projects?.length === 0 ? (
                <EmptyState
                  title="No projects yet"
                  description="Create your first custom or GitHub-linked project to start organizing."
                  action={{
                    label: "+ Create Project",
                    onClick: () => router.push("/projects"),
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((project: any) => (
                    <div
                      key={project.id}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="cursor-pointer rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={project.status?.toLowerCase() || "active"}>
                          {project.status || "Active"}
                        </Badge>
                        {project.github_repo && (
                          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                            GitHub
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-neutral-900 truncate mb-1">
                        {project.name}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-2 mb-3">
                        {project.description || "No description set."}
                      </p>
                      <div className="text-[11px] text-neutral-400 font-medium">
                        Open workspace →
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 col) */}
          <div className="space-y-8">
            {/* Recent Activity Feed */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <h2 className="text-base font-semibold text-neutral-900 mb-4">Recent Activity</h2>
              {recent_activities?.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">Your workspace activity will appear here.</p>
              ) : (
                <div className="space-y-4">
                  {recent_activities.map((act: any, i: number) => (
                    <div key={act.id || i} className="flex items-start gap-3 text-xs">
                      <div className="mt-0.5 size-2 rounded-full bg-neutral-400 shrink-0" />
                      <div>
                        <p className="text-neutral-800 font-medium">{act.action || act.description || "Activity logged"}</p>
                        <span className="text-[10px] text-neutral-400">
                          {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Personal Vault Card */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-neutral-900">Personal Vault</h2>
                <Badge variant="accent">Private</Badge>
              </div>
              <p className="text-xs text-neutral-500 mb-4">
                Securely store files, links, and personal notes.
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                  <div className="font-semibold text-neutral-900">{vault?.file_count || 0}</div>
                  <div className="text-[10px] text-neutral-400">Files</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                  <div className="font-semibold text-neutral-900">{vault?.link_count || 0}</div>
                  <div className="text-[10px] text-neutral-400">Links</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                  <div className="font-semibold text-neutral-900">{vault?.note_count || 0}</div>
                  <div className="text-[10px] text-neutral-400">Notes</div>
                </div>
              </div>
              <Link href="/vault">
                <Button variant="outline" size="sm" className="w-full text-xs font-medium">
                  Open Vault
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
