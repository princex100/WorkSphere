import api from "@/lib/auth/axios";
import { ProjectWithWorkspace } from "@/types/project.type";
import { ActivityLog } from "@/types/activity.type";
import { ProjectGitHubRepository } from "@/types/github.type";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CreateProjectPayload {
    name: string;
    description?: string;
    status?: string;
    start_date?: string;
    due_date?: string;
    github_repo?: {
        repo_id: string;
        repo_name: string;
        repo_owner: string;
        repo_url: string;
        default_branch?: string;
    };
}

export interface UpdateProjectPayload {
    name?: string;
    description?: string;
    status?: string;
    start_date?: string | null;
    due_date?: string | null;
}

// ── API Functions ─────────────────────────────────────────────────────────────

export async function getProjects(): Promise<ProjectWithWorkspace[]> {
    const res = await api.get<ApiResponse<ProjectWithWorkspace[]>>("/projects");
    return res.data.data;
}

export async function getProject(id: string): Promise<ProjectWithWorkspace> {
    const res = await api.get<ApiResponse<ProjectWithWorkspace>>(`/projects/${id}`);
    return res.data.data;
}

export async function createProject(payload: CreateProjectPayload): Promise<ProjectWithWorkspace> {
    const res = await api.post<ApiResponse<ProjectWithWorkspace>>("/projects", payload);
    return res.data.data;
}

export async function updateProject(id: string, payload: UpdateProjectPayload): Promise<ProjectWithWorkspace> {
    const res = await api.patch<ApiResponse<ProjectWithWorkspace>>(`/projects/${id}`, payload);
    return res.data.data;
}

export async function deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
}

export async function getProjectActivities(projectId: string, limit = 20, offset = 0): Promise<ActivityLog[]> {
    const res = await api.get<ApiResponse<ActivityLog[]>>(
        `/projects/${projectId}/activities?limit=${limit}&offset=${offset}`
    );
    return res.data.data;
}

// ── GitHub Integration for Project ───────────────────────────────────────────

export async function getProjectGitHub(projectId: string): Promise<ProjectGitHubRepository | null> {
    const res = await api.get<ApiResponse<ProjectGitHubRepository | null>>(`/projects/${projectId}/github`);
    return res.data.data;
}

export async function linkProjectGitHub(
    projectId: string,
    payload: { repo_id: string; repo_name: string; repo_owner: string; repo_url: string; default_branch?: string }
): Promise<ProjectGitHubRepository> {
    const res = await api.post<ApiResponse<ProjectGitHubRepository>>(`/projects/${projectId}/github`, payload);
    return res.data.data;
}

export async function unlinkProjectGitHub(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/github`);
}
