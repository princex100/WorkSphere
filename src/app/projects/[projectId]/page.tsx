"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProject, useDeleteProject, useUpdateProject } from "@/hooks/projects/useProjects";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { Badge, projectStatusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type TabType = "overview" | "tasks" | "files" | "resources" | "integrations" | "activity";

export default function ProjectWorkspacePage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;
  const router = useRouter();

  const { data: project, isLoading, isError, error, refetch } = useProject(projectId);
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject(projectId);

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProjectMutation.mutate(projectId, {
        onSuccess: () => router.push("/projects"),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
        <AppNavbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          <SkeletonText lines={3} />
          <div className="mt-8">
            <SkeletonCard />
          </div>
        </main>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
        <AppNavbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-16">
          <ErrorState
            title="Project not found"
            description="We couldn't retrieve the requested project or you may not have permission to view it."
            onRetry={() => refetch()}
          />
        </main>
      </div>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "tasks", label: "Tasks" },
    { key: "files", label: "Files" },
    { key: "resources", label: "Resources" },
    { key: "integrations", label: "Integrations & GitHub" },
    { key: "activity", label: "Activity" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      <AppNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Back to Projects
          </Link>
        </div>

        {/* Project Persistent Header */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                  {project.name}
                </h1>
                <Badge variant={projectStatusVariant(project.status)}>
                  {project.status || "Active"}
                </Badge>
                {project.github_repo && (
                  <span className="text-[10px] font-mono text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                    GitHub Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 max-w-2xl">
                {project.description || "No description set for this project."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                isLoading={deleteProjectMutation.isPending}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-neutral-200"
              >
                Delete Project
              </Button>
            </div>
          </div>

          {/* Project Dates & Meta */}
          <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap gap-6 text-xs text-neutral-400">
            <div>
              Start date: <span className="text-neutral-700 font-medium">{project.start_date ? new Date(project.start_date).toLocaleDateString() : "Not set"}</span>
            </div>
            <div>
              Due date: <span className="text-neutral-700 font-medium">{project.due_date ? new Date(project.due_date).toLocaleDateString() : "Not set"}</span>
            </div>
          </div>
        </div>

        {/* Project Workspace Tabs */}
        <div className="border-b border-neutral-200 mb-6 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-neutral-900 text-neutral-900 font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: OVERVIEW ───────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Project Overview</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {project.description || "No detailed description provided."}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button onClick={() => setActiveTab("tasks")} className="p-3 rounded-xl border border-neutral-100 bg-neutral-50 hover:bg-neutral-100/80 text-left text-xs transition-colors">
                    <div className="font-semibold text-neutral-900">+ Add Task</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Manage tasks</div>
                  </button>
                  <button onClick={() => setActiveTab("files")} className="p-3 rounded-xl border border-neutral-100 bg-neutral-50 hover:bg-neutral-100/80 text-left text-xs transition-colors">
                    <div className="font-semibold text-neutral-900">Upload File</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Cloudinary storage</div>
                  </button>
                  <button onClick={() => setActiveTab("resources")} className="p-3 rounded-xl border border-neutral-100 bg-neutral-50 hover:bg-neutral-100/80 text-left text-xs transition-colors">
                    <div className="font-semibold text-neutral-900">Add Link</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">External resources</div>
                  </button>
                  <button onClick={() => setActiveTab("integrations")} className="p-3 rounded-xl border border-neutral-100 bg-neutral-50 hover:bg-neutral-100/80 text-left text-xs transition-colors">
                    <div className="font-semibold text-neutral-900">GitHub Sync</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Link repository</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Integration Status</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 bg-neutral-50">
                    <span className="font-medium text-neutral-700">GitHub Repo</span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {project.github_repo ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 bg-neutral-50">
                    <span className="font-medium text-neutral-700">Cloudinary Files</span>
                    <span className="text-[10px] font-mono text-neutral-500">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: TASKS ──────────────────────────────────────────────────── */}
        {activeTab === "tasks" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-900">Project Tasks</h3>
            </div>
            <EmptyState
              title="No project tasks yet"
              description="Tasks created for this project will appear in TODO, IN PROGRESS, and COMPLETED stages."
            />
          </div>
        )}

        {/* ── TAB 3: FILES ──────────────────────────────────────────────────── */}
        {activeTab === "files" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Project Files (Cloudinary)</h3>
            <EmptyState
              title="No files uploaded"
              description="Upload images, documents, and assets associated with this project."
            />
          </div>
        )}

        {/* ── TAB 4: RESOURCES ──────────────────────────────────────────────── */}
        {activeTab === "resources" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Project Resources & Links</h3>
            <EmptyState
              title="No external links or resources"
              description="Add links to Figma designs, Notion pages, Google Docs, or reference materials."
            />
          </div>
        )}

        {/* ── TAB 5: INTEGRATIONS ───────────────────────────────────────────── */}
        {activeTab === "integrations" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs max-w-xl">
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">GitHub Integration</h3>
            <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
              Connect a GitHub repository to automatically sync commits, pull requests, and activity directly to this project workspace.
            </p>
            {project.github_repo ? (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 text-xs text-emerald-800">
                Connected to GitHub repository: <strong>{project.github_repo.repo_name || "Connected"}</strong>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-600">
                No GitHub repository connected yet. You can link a repository anytime.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 6: ACTIVITY ───────────────────────────────────────────────── */}
        {activeTab === "activity" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Project Activity Feed</h3>
            <p className="text-xs text-neutral-400">All task updates, file uploads, and commit logs for this project will be recorded here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
