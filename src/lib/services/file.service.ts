import { ApiError } from "@/lib/errors/ApiError";
import {
    createProjectFileInDB,
    findProjectFilesByProjectId,
    findProjectFileById,
    updateProjectFileInDB,
    deleteProjectFileInDB,
    FileFilterOptions
} from "../repositories/file.repository";
import { findProjectByIdAndUser } from "../repositories/project.repository";
import { updateUserAvatarInDB } from "../repositories/user.repository";
import { verifyWorkspaceMembership } from "./workspace.service";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";
import { ProjectFile } from "@/types/file.type";
import { ACTIVITY_ACTION, ENTITY_TYPE } from "@/constants";
import { logActivity } from "./activity.service";

export const uploadProjectFile = async (
    userId: string,
    projectId: string,
    file: File,
    isFavorite: boolean = false
): Promise<ProjectFile> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    if (!file) {
        throw new ApiError("File is required", 400, [
            { field: "file", message: "No file provided for upload" }
        ]);
    }

    const project = await findProjectByIdAndUser(projectId, userId);
    if (!project) {
        throw new ApiError("Project not found", 404, [
            { field: "project", message: "Project not found" }
        ]);
    }

    await verifyWorkspaceMembership(project.workspace_id, userId);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let resourceType: "image" | "raw" | "video" | "auto" = "auto";
    if (file.type.startsWith("image/")) {
        resourceType = "image";
    } else if (file.type.startsWith("video/")) {
        resourceType = "video";
    } else {
        resourceType = "raw";
    }

    const uploadResult = await uploadBufferToCloudinary(buffer, {
        folder: `worksphere/projects/${projectId}`,
        resource_type: resourceType
    });

    const projectFile = await createProjectFileInDB({
        project_id: projectId,
        uploaded_by: userId,
        original_name: file.name,
        cloudinary_url: uploadResult.secure_url,
        cloudinary_public_id: uploadResult.public_id,
        resource_type: uploadResult.resource_type || resourceType,
        mime_type: file.type || null,
        file_size: file.size,
        is_favorite: isFavorite
    });

    if (!projectFile) {
        throw new ApiError("File save failed", 500, [
            { field: "file", message: "Failed to store file metadata in database" }
        ]);
    }

    await logActivity({
        workspace_id: project.workspace_id,
        actor_id: userId,
        project_id: projectId,
        action: ACTIVITY_ACTION.FILE_UPLOADED,
        entity_type: ENTITY_TYPE.FILE,
        entity_id: projectFile.id,
        metadata: { original_name: projectFile.original_name, file_size: projectFile.file_size }
    });

    return projectFile;
};

export const getProjectFiles = async (
    userId: string,
    projectId: string,
    filters: FileFilterOptions = {}
): Promise<ProjectFile[]> => {
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

    return await findProjectFilesByProjectId(projectId, filters);
};

export const updateProjectFile = async (
    userId: string,
    projectId: string,
    fileId: string,
    data: { original_name?: string; is_favorite?: boolean }
): Promise<ProjectFile> => {
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

    const existingFile = await findProjectFileById(fileId);
    if (!existingFile || existingFile.project_id !== projectId) {
        throw new ApiError("File not found", 404, [
            { field: "file", message: "File not found in this project" }
        ]);
    }

    const updated = await updateProjectFileInDB(fileId, data);
    if (!updated) {
        throw new ApiError("File update failed", 500, [
            { field: "file", message: "Failed to update file metadata" }
        ]);
    }

    return updated;
};

export const deleteProjectFile = async (
    userId: string,
    projectId: string,
    fileId: string
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

    const existingFile = await findProjectFileById(fileId);
    if (!existingFile || existingFile.project_id !== projectId) {
        throw new ApiError("File not found", 404, [
            { field: "file", message: "File not found in this project" }
        ]);
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(existingFile.cloudinary_public_id, existingFile.resource_type);

    // Delete from DB
    const deleted = await deleteProjectFileInDB(fileId);
    if (!deleted) {
        throw new ApiError("File deletion failed", 500, [
            { field: "file", message: "Failed to delete file from database" }
        ]);
    }

    await logActivity({
        workspace_id: project.workspace_id,
        actor_id: userId,
        project_id: projectId,
        action: ACTIVITY_ACTION.FILE_DELETED,
        entity_type: ENTITY_TYPE.FILE,
        entity_id: fileId,
        metadata: { original_name: existingFile.original_name }
    });

    return { id: fileId };
};

export const uploadUserAvatar = async (userId: string, file: File) => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Authentication required" }
        ]);
    }

    if (!file) {
        throw new ApiError("File is required", 400, [
            { field: "file", message: "No avatar image provided" }
        ]);
    }

    if (!file.type.startsWith("image/")) {
        throw new ApiError("Invalid file type", 400, [
            { field: "file", message: "Avatar must be an image" }
        ]);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadBufferToCloudinary(buffer, {
        folder: "worksphere/avatars",
        resource_type: "image"
    });

    const updatedUser = await updateUserAvatarInDB(userId, uploadResult.secure_url);
    if (!updatedUser) {
        throw new ApiError("Failed to update avatar", 500, [
            { field: "avatar", message: "Failed to update user avatar" }
        ]);
    }

    return updatedUser;
};
