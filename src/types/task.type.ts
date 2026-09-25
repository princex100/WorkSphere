import { TaskPriority, TaskStatus } from "@/constants";

export interface Task {
    id: string;
    workspace_id: string;
    project_id: string | null;
    parent_task_id: string | null;
    created_by: string;
    assigned_to: string | null;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: Date | null;
    is_favorite: boolean;
    created_at: Date;
    updated_at: Date;
    subtasks?: Task[];
    project_name?: string;
    creator_name?: string;
}
