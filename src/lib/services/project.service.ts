import { ApiError } from "@/lib/errors/ApiError";
import {
    createProjectInDB,
    findProjectsByWorkspaceAndUser,
    findProjectByIdAndUser,
    updateProjectInDB,
    deleteProjectInDB
} from "../repositories/project.repository";
import { getCurrentWorkspace, verifyWorkspaceMembership } from "./workspace.service";
import { Project, ProjectWithWorkspace } from "@/types/project.type";
import { ProjectStatus } from "@/constants";

export interface CreateProjectDTO {
    name: string;
    description?: string | null;
    status?: ProjectStatus;
    start_date?: string | null;
    due_date?: string | null;
    workspace_id?: string;
}

export interface UpdateProjectDTO {
    name?: string;
    description?: string | null;
    status?: ProjectStatus;
    start_date?: string | null;
    due_date?: string | null;
}

export const createProject = async (
    userId: string,
    data: CreateProjectDTO
): Promise<Project> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    let targetWorkspaceId = data.workspace_id;

    if (targetWorkspaceId) {
        // Explicit workspace requested: verify user is a member with write permission
        await verifyWorkspaceMembership(targetWorkspaceId, userId, [
            "OWNER",
            "ADMIN",
            "MEMBER"
        ]);
    } else {
        // Default to the user's primary/personal workspace
        const currentWorkspace = await getCurrentWorkspace(userId);
        targetWorkspaceId = currentWorkspace.id;
    }

    const startDate = data.start_date ? new Date(data.start_date) : null;
    const dueDate = data.due_date ? new Date(data.due_date) : null;

    if (startDate && dueDate && startDate > dueDate) {
        throw new ApiError("Validation error", 400, [
            { field: "due_date", message: "due_date must be greater than or equal to start_date" }
        ]);
    }

    const newProject = await createProjectInDB({
        workspace_id: targetWorkspaceId,
        created_by: userId,
        name: data.name,
        description: data.description,
        status: data.status,
        start_date: startDate,
        due_date: dueDate
    });

    if (!newProject) {
        throw new ApiError("Project creation failed", 500, [
            { field: "project", message: "Failed to create project" }
        ]);
    }

    return newProject;
};

export const getProjects = async (
    userId: string,
    workspaceId?: string
): Promise<ProjectWithWorkspace[]> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    if (workspaceId) {
        await verifyWorkspaceMembership(workspaceId, userId);
    }

    return await findProjectsByWorkspaceAndUser(userId, workspaceId);
};

export const getProjectById = async (
    userId: string,
    projectId: string
): Promise<ProjectWithWorkspace> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    const project = await findProjectByIdAndUser(projectId, userId);
    if (!project) {
        throw new ApiError("Project not found", 404, [
            { field: "project", message: "Project not found" }
        ]);
    }

    return project;
};

export const updateProject = async (
    userId: string,
    projectId: string,
    data: UpdateProjectDTO
): Promise<Project> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    // Verify project exists and user has workspace membership
    const existingProject = await findProjectByIdAndUser(projectId, userId);
    if (!existingProject) {
        throw new ApiError("Project not found", 404, [
            { field: "project", message: "Project not found" }
        ]);
    }

    const startDate = data.start_date !== undefined ? (data.start_date ? new Date(data.start_date) : null) : undefined;
    const dueDate = data.due_date !== undefined ? (data.due_date ? new Date(data.due_date) : null) : undefined;

    const effectiveStart = startDate !== undefined ? startDate : existingProject.start_date;
    const effectiveDue = dueDate !== undefined ? dueDate : existingProject.due_date;

    if (effectiveStart && effectiveDue && new Date(effectiveStart) > new Date(effectiveDue)) {
        throw new ApiError("Validation error", 400, [
            { field: "due_date", message: "due_date must be greater than or equal to start_date" }
        ]);
    }

    const updated = await updateProjectInDB(projectId, userId, {
        name: data.name,
        description: data.description,
        status: data.status,
        start_date: startDate,
        due_date: dueDate
    });

    if (!updated) {
        throw new ApiError("Project update failed", 404, [
            { field: "project", message: "Project not found or not modified" }
        ]);
    }

    return updated;
};

export const deleteProject = async (
    userId: string,
    projectId: string
): Promise<{ id: string }> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    const deleted = await deleteProjectInDB(projectId, userId);
    if (!deleted) {
        throw new ApiError("Project not found", 404, [
            { field: "project", message: "Project not found or already deleted" }
        ]);
    }

    return { id: projectId };
};
