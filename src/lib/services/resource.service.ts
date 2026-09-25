import { ApiError } from "@/lib/errors/ApiError";
import {
    createResourceInDB,
    findResourcesByProjectId,
    findResourceById,
    updateResourceInDB,
    deleteResourceInDB,
    ResourceFilterOptions
} from "../repositories/resource.repository";
import { findProjectByIdAndUser } from "../repositories/project.repository";
import { verifyWorkspaceMembership } from "./workspace.service";
import { ProjectResource } from "@/types/resource.type";
import { ResourceCategory, ACTIVITY_ACTION, ENTITY_TYPE } from "@/constants";
import { logActivity } from "./activity.service";

export interface CreateResourceDTO {
    name: string;
    url: string;
    description?: string | null;
    category?: ResourceCategory;
    is_favorite?: boolean;
}

export interface UpdateResourceDTO {
    name?: string;
    url?: string;
    description?: string | null;
    category?: ResourceCategory;
    is_favorite?: boolean;
}

export const createResource = async (
    userId: string,
    projectId: string,
    data: CreateResourceDTO
): Promise<ProjectResource> => {
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

    await verifyWorkspaceMembership(project.workspace_id, userId);

    const resource = await createResourceInDB({
        project_id: projectId,
        created_by: userId,
        name: data.name,
        url: data.url,
        description: data.description,
        category: data.category,
        is_favorite: data.is_favorite
    });

    if (!resource) {
        throw new ApiError("Resource creation failed", 500, [
            { field: "resource", message: "Failed to create resource" }
        ]);
    }

    await logActivity({
        workspace_id: project.workspace_id,
        actor_id: userId,
        project_id: projectId,
        action: ACTIVITY_ACTION.RESOURCE_CREATED,
        entity_type: ENTITY_TYPE.RESOURCE,
        entity_id: resource.id,
        metadata: { name: resource.name, category: resource.category, url: resource.url }
    });

    return resource;
};

export const getResources = async (
    userId: string,
    projectId: string,
    filters: ResourceFilterOptions = {}
): Promise<ProjectResource[]> => {
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

    await verifyWorkspaceMembership(project.workspace_id, userId);

    return await findResourcesByProjectId(projectId, filters);
};

export const updateResource = async (
    userId: string,
    projectId: string,
    resourceId: string,
    data: UpdateResourceDTO
): Promise<ProjectResource> => {
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

    await verifyWorkspaceMembership(project.workspace_id, userId);

    const existingResource = await findResourceById(resourceId);
    if (!existingResource || existingResource.project_id !== projectId) {
        throw new ApiError("Resource not found", 404, [
            { field: "resource", message: "Resource not found in this project" }
        ]);
    }

    const updated = await updateResourceInDB(resourceId, data);
    if (!updated) {
        throw new ApiError("Resource update failed", 500, [
            { field: "resource", message: "Failed to update resource" }
        ]);
    }

    await logActivity({
        workspace_id: project.workspace_id,
        actor_id: userId,
        project_id: projectId,
        action: ACTIVITY_ACTION.RESOURCE_UPDATED,
        entity_type: ENTITY_TYPE.RESOURCE,
        entity_id: resourceId,
        metadata: { name: updated.name, category: updated.category }
    });

    return updated;
};

export const deleteResource = async (
    userId: string,
    projectId: string,
    resourceId: string
): Promise<{ id: string }> => {
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

    await verifyWorkspaceMembership(project.workspace_id, userId);

    const existingResource = await findResourceById(resourceId);
    if (!existingResource || existingResource.project_id !== projectId) {
        throw new ApiError("Resource not found", 404, [
            { field: "resource", message: "Resource not found in this project" }
        ]);
    }

    const deleted = await deleteResourceInDB(resourceId);
    if (!deleted) {
        throw new ApiError("Resource deletion failed", 500, [
            { field: "resource", message: "Failed to delete resource" }
        ]);
    }

    await logActivity({
        workspace_id: project.workspace_id,
        actor_id: userId,
        project_id: projectId,
        action: ACTIVITY_ACTION.RESOURCE_DELETED,
        entity_type: ENTITY_TYPE.RESOURCE,
        entity_id: resourceId,
        metadata: { name: existingResource.name }
    });

    return { id: resourceId };
};
