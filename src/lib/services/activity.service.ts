import { ApiError } from "@/lib/errors/ApiError";
import {
    createActivityInDB,
    findActivitiesByProjectId,
    findRecentActivitiesByWorkspaceId,
    CreateActivityInput
} from "../repositories/activity.repository";
import { getCurrentWorkspace, verifyWorkspaceMembership } from "./workspace.service";
import { findProjectByIdAndUser } from "../repositories/project.repository";
import { ActivityLog } from "@/types/activity.type";

export const logActivity = async (data: CreateActivityInput): Promise<ActivityLog | null> => {
    try {
        return await createActivityInDB(data);
    } catch (error) {
        console.error("Failed to log activity:", error);
        return null;
    }
};

export const getProjectActivities = async (
    userId: string,
    projectId: string,
    limit: number = 50,
    offset: number = 0
): Promise<ActivityLog[]> => {
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

    return await findActivitiesByProjectId(projectId, limit, offset);
};

export const getRecentWorkspaceActivities = async (
    userId: string,
    workspaceId?: string,
    limit: number = 20
): Promise<ActivityLog[]> => {
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

    return await findRecentActivitiesByWorkspaceId(targetWorkspaceId, limit);
};
