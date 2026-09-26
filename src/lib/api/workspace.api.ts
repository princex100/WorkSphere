import api from "@/lib/auth/axios";
import { Workspace } from "@/types/workspace.type";
import { Task } from "@/types/task.type";
import { ProjectWithWorkspace } from "@/types/project.type";
import { VaultSummary } from "@/types/vault.type";
import { ActivityLog } from "@/types/activity.type";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export interface DashboardData {
    workspace: Workspace;
    stats: {
        today_tasks_count: number;
        upcoming_tasks_count: number;
        projects_count: number;
        projects_limit: number;
        is_limit_reached: boolean;
    };
    today_tasks: Task[];
    upcoming_tasks: Task[];
    projects: ProjectWithWorkspace[];
    recent_activities: ActivityLog[];
    vault: VaultSummary;
}

export async function getCurrentWorkspace(): Promise<Workspace> {
    const res = await api.get<ApiResponse<Workspace>>("/workspaces/current");
    return res.data.data;
}

export async function getDashboard(): Promise<DashboardData> {
    const res = await api.get<ApiResponse<DashboardData>>("/workspaces/current/dashboard");
    return res.data.data;
}

export async function getWorkspaceActivities(limit = 20): Promise<ActivityLog[]> {
    const res = await api.get<ApiResponse<ActivityLog[]>>(`/workspaces/current/activities?limit=${limit}`);
    return res.data.data;
}
