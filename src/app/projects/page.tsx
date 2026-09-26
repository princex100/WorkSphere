"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjects, useCreateProject } from "@/hooks/projects/useProjects";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ProjectsPage() {
  const router = useRouter();
  const { data: projects, isLoading, isError, error, refetch } = useProjects();
  const createProjectMutation = useCreateProject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "PLANNING",
    start_date: "",
    due_date: "",
  });

  const projectCount = projects?.length || 0;
  const projectLimit = 10;
  const isLimitReached = projectCount >= projectLimit;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    createProjectMutation.mutate(
      {
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        start_date: formData.start_date || undefined,
        due_date: formData.due_date || undefined,
      },
      {
        onSuccess: (newProject) => {
          setIsModalOpen(false);
          setFormData({ name: "", description: "", status: "PLANNING", start_date: "", due_date: "" });
          router.push(`/projects/${newProject.id}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      <AppNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                Projects
              </h1>
              <span className="rounded-full border border-neutral-200 bg-white px-3 py-0.5 text-xs font-medium text-neutral-600">
                {projectCount} / {projectLimit} limit
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              Manage your personal workspace projects, tasks, resources, and GitHub repositories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={isLimitReached}
              onClick={() => setIsModalOpen(true)}
              className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 text-xs px-4"
            >
              + Create Custom Project
            </Button>
          </div>
        </div>

        {/* Limit reached warning banner */}
        {isLimitReached && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-800 flex items-center justify-between">
            <span>
              You have reached the <strong>10-project limit</strong> for Personal Workspace. Delete an existing project to create a new one.
            </span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error */}
        {isError && (
          <ErrorState
            title="Failed to load projects"
            description="We couldn't fetch your projects. Please try again."
            onRetry={() => refetch()}
          />
        )}

        {/* Empty */}
        {!isLoading && !isError && projects?.length === 0 && (
          <EmptyState
            title="No projects found"
            description="Start by creating your first custom project."
            action={{
              label: "+ Create Project",
              onClick: () => setIsModalOpen(true),
            }}
          />
        )}

        {/* Projects Grid */}
        {!isLoading && !isError && projects && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project: any) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="group relative cursor-pointer rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs hover:border-neutral-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={project.status?.toLowerCase() || "active"}>
                      {project.status || "Active"}
                    </Badge>
                    {project.github_repo && (
                      <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200/60">
                        GitHub
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-neutral-900 group-hover:text-neutral-900 transition-colors mb-1.5 truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2 mb-4 leading-relaxed">
                    {project.description || "No description set."}
                  </p>
                </div>

                <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-xs text-neutral-400">
                  <span>
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : "No start date"}
                  </span>
                  <span className="text-neutral-900 font-medium group-hover:translate-x-0.5 transition-transform">
                    Open workspace →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Create Project Modal ────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl animate-fade-up">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-5">
              <h2 className="text-lg font-semibold text-neutral-900">Create Custom Project</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 text-sm font-medium"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <Input
                label="Project Name *"
                placeholder="e.g., WorkSphere Mobile App"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description of this project..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PAUSED">Paused</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={createProjectMutation.isPending}
                  className="bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
