import { ApiError } from "@/lib/errors/ApiError";
import {
    createProjectInDB,
    findProjectsByWorkspaceAndUser,
    findProjectByIdAndUser,
    updateProjectInDB,
    deleteProjectInDB,
    countProjectsInWorkspace
} from "../repositories/project.repository";
import { getCurrentWorkspace, verifyWorkspaceMembership } from "./workspace.service";
import { Project, ProjectWithWorkspace } from "@/types/project.type";
import { ProjectStatus, PERSONAL_WORKSPACE_PROJECT_LIMIT, ACTIVITY_ACTION, ENTITY_TYPE } from "@/constants";
import { logActivity } from "./activity.service";

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
        // Explicit workspace requested: verify user is OWNER or ADMIN
        await verifyWorkspaceMembership(targetWorkspaceId, userId, [
            "OWNER",
            "ADMIN"
        ]);
    } else {
        // Default to the user's primary/personal workspace
        const currentWorkspace = await getCurrentWorkspace(userId);
        targetWorkspaceId = currentWorkspace.id;

        // Verify role in default workspace
        await verifyWorkspaceMembership(targetWorkspaceId, userId, [
            "OWNER",
            "ADMIN"
        ]);
    }

    // Check project limit in workspace
    const projectCount = await countProjectsInWorkspace(targetWorkspaceId);
    if (projectCount >= PERSONAL_WORKSPACE_PROJECT_LIMIT) {
        throw new ApiError("Project limit reached", 400, [
            {
                field: "project",
                message: `You can create a maximum of ${PERSONAL_WORKSPACE_PROJECT_LIMIT} projects in your personal workspace`
            }
        ]);
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

    // Log Activity
    await logActivity({
        workspace_id: targetWorkspaceId,
        actor_id: userId,
        project_id: newProject.id,
        action: ACTIVITY_ACTION.PROJECT_CREATED,
        entity_type: ENTITY_TYPE.PROJECT,
        entity_id: newProject.id,
        metadata: { name: newProject.name, status: newProject.status }
    });

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

    // Verify user is OWNER or ADMIN of the workspace
    await verifyWorkspaceMembership(existingProject.workspace_id, userId, [
        "OWNER",
        "ADMIN"
    ]);

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

    // Log Activity
    await logActivity({
        workspace_id: existingProject.workspace_id,
        actor_id: userId,
        project_id: projectId,
        action: ACTIVITY_ACTION.PROJECT_UPDATED,
        entity_type: ENTITY_TYPE.PROJECT,
        entity_id: projectId,
        metadata: { name: updated.name, status: updated.status }
    });

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

    const existingProject = await findProjectByIdAndUser(projectId, userId);
    if (!existingProject) {
        throw new ApiError("Project not found", 404, [
            { field: "project", message: "Project not found" }
        ]);
    }

    // Verify user is OWNER or ADMIN of the workspace
    await verifyWorkspaceMembership(existingProject.workspace_id, userId, [
        "OWNER",
        "ADMIN"
    ]);

    const deleted = await deleteProjectInDB(projectId, userId);
    if (!deleted) {
        throw new ApiError("Project not found", 404, [
            { field: "project", message: "Project not found or already deleted" }
        ]);
    }

    // Log Activity
    await logActivity({
        workspace_id: existingProject.workspace_id,
        actor_id: userId,
        project_id: null,
        action: ACTIVITY_ACTION.PROJECT_DELETED,
        entity_type: ENTITY_TYPE.PROJECT,
        entity_id: projectId,
        metadata: { name: existingProject.name }
    });

    return { id: projectId };
};
