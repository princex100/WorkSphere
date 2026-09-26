import api from "@/lib/auth/axios";
import { Task } from "@/types/task.type";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export interface CreateTaskPayload {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
    project_id?: string;
    parent_task_id?: string;
}

export interface UpdateTaskPayload {
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    due_date?: string | null;
    is_favorite?: boolean;
}

export interface TaskFilters {
    status?: string;
    priority?: string;
    project_id?: string;
}

export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status)     params.set("status", filters.status);
    if (filters?.priority)   params.set("priority", filters.priority);
    if (filters?.project_id) params.set("project_id", filters.project_id);
    const query = params.toString();
    const res = await api.get<ApiResponse<Task[]>>(`/tasks${query ? `?${query}` : ""}`);
    return res.data.data;
}

export async function getTask(id: string): Promise<Task> {
    const res = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data.data;
}

export async function getTodayTasks(): Promise<Task[]> {
    const res = await api.get<ApiResponse<Task[]>>("/tasks/today");
    return res.data.data;
}

export async function getUpcomingTasks(): Promise<Task[]> {
    const res = await api.get<ApiResponse<Task[]>>("/tasks/upcoming");
    return res.data.data;
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
    const res = await api.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`);
    return res.data.data;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
    const res = await api.post<ApiResponse<Task>>("/tasks", payload);
    return res.data.data;
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return res.data.data;
}

export async function deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
}
