import { ApiError } from "@/lib/errors/ApiError";
import {
    findUserWorkspaces,
    findPersonalWorkspaceByUserId,
    findWorkspaceMember,
    findWorkspaceById
} from "../repositories/workspace.repository";
import { WorkspaceWithRole, WorkspaceMember } from "@/types/workspace.type";

export const getUserWorkspaces = async (userId: string): Promise<WorkspaceWithRole[]> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }
    return await findUserWorkspaces(userId);
};

export const getCurrentWorkspace = async (userId: string): Promise<WorkspaceWithRole> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    const personalWorkspace = await findPersonalWorkspaceByUserId(userId);
    if (!personalWorkspace) {
        throw new ApiError("No workspace found for user", 404, [
            { field: "workspace", message: "No active workspace found for user" }
        ]);
    }

    return personalWorkspace;
};

export const verifyWorkspaceMembership = async (
    workspaceId: string,
    userId: string,
    allowedRoles?: string[]
): Promise<WorkspaceMember> => {
    if (!workspaceId || !userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "workspace", message: "Workspace and user are required" }
        ]);
    }

    const member = await findWorkspaceMember(workspaceId, userId);
    if (!member) {
        // Return 404 to prevent resource existence enumeration across tenants
        throw new ApiError("Workspace not found or access denied", 404, [
            { field: "workspace", message: "Workspace not found or access denied" }
        ]);
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
        throw new ApiError("Forbidden", 403, [
            { field: "role", message: "Insufficient permissions for this workspace action" }
        ]);
    }

    return member;
};
