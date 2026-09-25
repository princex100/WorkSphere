import { ApiError } from "@/lib/errors/ApiError";
import {
    createTaskInDB,
    findTasksByWorkspaceAndUser,
    findTasksDueToday,
    findUpcomingTasks,
    findTaskById,
    findSubtasksByParentId,
    updateTaskInDB,
    deleteTaskInDB,
    TaskFilterOptions
} from "../repositories/task.repository";
import { getCurrentWorkspace, verifyWorkspaceMembership } from "./workspace.service";
import { findProjectByIdAndUser } from "../repositories/project.repository";
import { Task } from "@/types/task.type";
import { TaskPriority, TaskStatus, ACTIVITY_ACTION, ENTITY_TYPE } from "@/constants";
import { logActivity } from "./activity.service";

export interface CreateTaskDTO {
    title: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string | null;
    project_id?: string | null;
    parent_task_id?: string | null;
    assigned_to?: string | null;
    workspace_id?: string;
}

export interface UpdateTaskDTO {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string | null;
    project_id?: string | null;
    parent_task_id?: string | null;
    assigned_to?: string | null;
    is_favorite?: boolean;
}

export const createTask = async (userId: string, data: CreateTaskDTO): Promise<Task> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    let targetWorkspaceId = data.workspace_id;
    let targetProjectId = data.project_id || null;

    if (targetProjectId) {
        const project = await findProjectByIdAndUser(targetProjectId, userId);
        if (!project) {
            throw new ApiError("Project not found", 404, [
                { field: "project_id", message: "Project not found or access denied" }
            ]);
        }
        targetWorkspaceId = project.workspace_id;
    } else if (targetWorkspaceId) {
        await verifyWorkspaceMembership(targetWorkspaceId, userId);
    } else {
        const currentWorkspace = await getCurrentWorkspace(userId);
        targetWorkspaceId = currentWorkspace.id;
    }

    // Verify parent task if subtask
    if (data.parent_task_id) {
        const parentTask = await findTaskById(data.parent_task_id);
        if (!parentTask || parentTask.workspace_id !== targetWorkspaceId) {
            throw new ApiError("Parent task not found", 404, [
                { field: "parent_task_id", message: "Parent task not found in this workspace" }
            ]);
        }
    }

    const dueDate = data.due_date ? new Date(data.due_date) : null;

    const newTask = await createTaskInDB({
        workspace_id: targetWorkspaceId,
        project_id: targetProjectId,
        parent_task_id: data.parent_task_id || null,
        created_by: userId,
        assigned_to: data.assigned_to || null,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        due_date: dueDate
    });

    if (!newTask) {
        throw new ApiError("Task creation failed", 500, [
            { field: "task", message: "Failed to create task" }
        ]);
    }

    // Log Activity
    await logActivity({
        workspace_id: targetWorkspaceId,
        actor_id: userId,
        project_id: targetProjectId,
        action: ACTIVITY_ACTION.TASK_CREATED,
        entity_type: ENTITY_TYPE.TASK,
        entity_id: newTask.id,
        metadata: { title: newTask.title, status: newTask.status, priority: newTask.priority }
    });

    return newTask;
};

export const getTasks = async (
    userId: string,
    filters: TaskFilterOptions & { workspaceId?: string } = {}
): Promise<Task[]> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    let targetWorkspaceId = filters.workspaceId;
    if (!targetWorkspaceId) {
        const currentWorkspace = await getCurrentWorkspace(userId);
        targetWorkspaceId = currentWorkspace.id;
    }

    await verifyWorkspaceMembership(targetWorkspaceId, userId);

    return await findTasksByWorkspaceAndUser(targetWorkspaceId, filters);
};

export const getTodayTasks = async (userId: string, workspaceId?: string): Promise<Task[]> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    let targetWorkspaceId = workspaceId;
    if (!targetWorkspaceId) {
        const currentWorkspace = await getCurrentWorkspace(userId);
        targetWorkspaceId = currentWorkspace.id;
    }

    await verifyWorkspaceMembership(targetWorkspaceId, userId);

    return await findTasksDueToday(targetWorkspaceId);
};

export const getUpcomingTasks = async (userId: string, workspaceId?: string): Promise<Task[]> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    let targetWorkspaceId = workspaceId;
    if (!targetWorkspaceId) {
        const currentWorkspace = await getCurrentWorkspace(userId);
        targetWorkspaceId = currentWorkspace.id;
    }

    await verifyWorkspaceMembership(targetWorkspaceId, userId);

    return await findUpcomingTasks(targetWorkspaceId);
};

export const getTaskById = async (userId: string, taskId: string): Promise<Task> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    const task = await findTaskById(taskId);
    if (!task) {
        throw new ApiError("Task not found", 404, [
            { field: "task", message: "Task not found" }
        ]);
    }

    await verifyWorkspaceMembership(task.workspace_id, userId);

    const subtasks = await findSubtasksByParentId(taskId);
    return {
        ...task,
        subtasks
    };
};

export const updateTask = async (
    userId: string,
    taskId: string,
    data: UpdateTaskDTO
): Promise<Task> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    const existingTask = await findTaskById(taskId);
    if (!existingTask) {
        throw new ApiError("Task not found", 404, [
            { field: "task", message: "Task not found" }
        ]);
    }

    await verifyWorkspaceMembership(existingTask.workspace_id, userId);

    const dueDate = data.due_date !== undefined ? (data.due_date ? new Date(data.due_date) : null) : undefined;

    const updatedTask = await updateTaskInDB(taskId, {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        due_date: dueDate,
        project_id: data.project_id,
        parent_task_id: data.parent_task_id,
        assigned_to: data.assigned_to,
        is_favorite: data.is_favorite
    });

    if (!updatedTask) {
        throw new ApiError("Task update failed", 500, [
            { field: "task", message: "Failed to update task" }
        ]);
    }

    const isCompleted = data.status === "COMPLETED" && existingTask.status !== "COMPLETED";

    await logActivity({
        workspace_id: existingTask.workspace_id,
        actor_id: userId,
        project_id: updatedTask.project_id,
        action: isCompleted ? ACTIVITY_ACTION.TASK_COMPLETED : ACTIVITY_ACTION.TASK_UPDATED,
        entity_type: ENTITY_TYPE.TASK,
        entity_id: taskId,
        metadata: { title: updatedTask.title, status: updatedTask.status }
    });

    return updatedTask;
};

export const deleteTask = async (userId: string, taskId: string): Promise<{ id: string }> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    const existingTask = await findTaskById(taskId);
    if (!existingTask) {
        throw new ApiError("Task not found", 404, [
            { field: "task", message: "Task not found" }
        ]);
    }

    await verifyWorkspaceMembership(existingTask.workspace_id, userId);

    const deleted = await deleteTaskInDB(taskId);
    if (!deleted) {
        throw new ApiError("Task deletion failed", 500, [
            { field: "task", message: "Failed to delete task" }
        ]);
    }

    await logActivity({
        workspace_id: existingTask.workspace_id,
        actor_id: userId,
        project_id: existingTask.project_id,
        action: ACTIVITY_ACTION.TASK_DELETED,
        entity_type: ENTITY_TYPE.TASK,
        entity_id: taskId,
        metadata: { title: existingTask.title }
    });

    return { id: taskId };
};
