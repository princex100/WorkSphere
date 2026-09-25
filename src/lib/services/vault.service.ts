import { ApiError } from "@/lib/errors/ApiError";
import bcrypt from "bcrypt";
import {
    getVaultPasswordHash,
    setVaultPasswordHash,
    createPersonalFileInDB,
    findPersonalFilesByUserId,
    findPersonalFileById,
    updatePersonalFileInDB,
    deletePersonalFileInDB,
    createPersonalLinkInDB,
    findPersonalLinksByUserId,
    findPersonalLinkById,
    updatePersonalLinkInDB,
    deletePersonalLinkInDB,
    createPersonalNoteInDB,
    findPersonalNotesByUserId,
    findPersonalNoteById,
    updatePersonalNoteInDB,
    deletePersonalNoteInDB,
    getVaultCountsByUserId
} from "../repositories/vault.repository";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";
import { PersonalFile, PersonalLink, PersonalNote, VaultSummary } from "@/types/vault.type";

// ==================== VAULT AUTH / PROTECTION ====================

export const setVaultPassword = async (
    userId: string,
    newPassword: string,
    currentPassword?: string
): Promise<{ success: boolean; message: string }> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const existingHash = await getVaultPasswordHash(userId);
    if (existingHash) {
        if (!currentPassword) {
            throw new ApiError("Current vault password is required", 400, [
                { field: "current_password", message: "Please provide your current vault password to change it" }
            ]);
        }
        const matches = await bcrypt.compare(currentPassword, existingHash);
        if (!matches) {
            throw new ApiError("Incorrect current vault password", 401, [
                { field: "current_password", message: "Current vault password is incorrect" }
            ]);
        }
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await setVaultPasswordHash(userId, hashed);

    return {
        success: true,
        message: existingHash ? "Vault password updated successfully" : "Vault password set successfully"
    };
};

export const unlockVault = async (
    userId: string,
    password: string
): Promise<{ success: boolean; message: string }> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const hash = await getVaultPasswordHash(userId);
    if (!hash) {
        return {
            success: true,
            message: "No vault password set. Vault unlocked."
        };
    }

    const matches = await bcrypt.compare(password, hash);
    if (!matches) {
        throw new ApiError("Invalid vault password", 401, [
            { field: "password", message: "Invalid vault password" }
        ]);
    }

    return {
        success: true,
        message: "Vault unlocked successfully"
    };
};

export const getVaultSummary = async (userId: string): Promise<VaultSummary> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const hash = await getVaultPasswordHash(userId);
    const counts = await getVaultCountsByUserId(userId);

    return {
        is_locked: !!hash,
        has_password: !!hash,
        file_count: counts.files,
        link_count: counts.links,
        note_count: counts.notes
    };
};

// ==================== PERSONAL FILES ====================

export const uploadPersonalFile = async (
    userId: string,
    file: File,
    isFavorite: boolean = false
): Promise<PersonalFile> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    if (!file) {
        throw new ApiError("File is required", 400, [{ field: "file", message: "No file provided" }]);
    }

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
        folder: `worksphere/vault/${userId}`,
        resource_type: resourceType
    });

    const personalFile = await createPersonalFileInDB({
        user_id: userId,
        name: file.name,
        cloudinary_url: uploadResult.secure_url,
        cloudinary_public_id: uploadResult.public_id,
        resource_type: uploadResult.resource_type || resourceType,
        mime_type: file.type || null,
        file_size: file.size,
        is_favorite: isFavorite
    });

    if (!personalFile) {
        throw new ApiError("Failed to save personal file", 500, [
            { field: "file", message: "Failed to store personal file in vault" }
        ]);
    }

    return personalFile;
};

export const getPersonalFiles = async (
    userId: string,
    filters: { search?: string; is_favorite?: boolean } = {}
): Promise<PersonalFile[]> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }
    return await findPersonalFilesByUserId(userId, filters);
};

export const updatePersonalFile = async (
    userId: string,
    fileId: string,
    data: { name?: string; is_favorite?: boolean }
): Promise<PersonalFile> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const updated = await updatePersonalFileInDB(fileId, userId, data);
    if (!updated) {
        throw new ApiError("Personal file not found", 404, [
            { field: "file", message: "File not found or access denied" }
        ]);
    }

    return updated;
};

export const deletePersonalFile = async (
    userId: string,
    fileId: string
): Promise<{ id: string }> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const existing = await findPersonalFileById(fileId, userId);
    if (!existing) {
        throw new ApiError("Personal file not found", 404, [
            { field: "file", message: "File not found or access denied" }
        ]);
    }

    await deleteFromCloudinary(existing.cloudinary_public_id, existing.resource_type);
    await deletePersonalFileInDB(fileId, userId);

    return { id: fileId };
};

// ==================== PERSONAL LINKS ====================

export const createPersonalLink = async (
    userId: string,
    data: { name: string; url: string; description?: string | null; is_favorite?: boolean }
): Promise<PersonalLink> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    return await createPersonalLinkInDB({
        user_id: userId,
        name: data.name,
        url: data.url,
        description: data.description,
        is_favorite: data.is_favorite
    });
};

export const getPersonalLinks = async (
    userId: string,
    filters: { search?: string; is_favorite?: boolean } = {}
): Promise<PersonalLink[]> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }
    return await findPersonalLinksByUserId(userId, filters);
};

export const updatePersonalLink = async (
    userId: string,
    linkId: string,
    data: { name?: string; url?: string; description?: string | null; is_favorite?: boolean }
): Promise<PersonalLink> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const updated = await updatePersonalLinkInDB(linkId, userId, data);
    if (!updated) {
        throw new ApiError("Personal link not found", 404, [
            { field: "link", message: "Link not found or access denied" }
        ]);
    }
    return updated;
};

export const deletePersonalLink = async (
    userId: string,
    linkId: string
): Promise<{ id: string }> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const deleted = await deletePersonalLinkInDB(linkId, userId);
    if (!deleted) {
        throw new ApiError("Personal link not found", 404, [
            { field: "link", message: "Link not found or access denied" }
        ]);
    }
    return { id: linkId };
};

// ==================== PERSONAL NOTES ====================

export const createPersonalNote = async (
    userId: string,
    data: { title: string; content?: string | null; is_favorite?: boolean }
): Promise<PersonalNote> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    return await createPersonalNoteInDB({
        user_id: userId,
        title: data.title,
        content: data.content,
        is_favorite: data.is_favorite
    });
};

export const getPersonalNotes = async (
    userId: string,
    filters: { search?: string; is_favorite?: boolean } = {}
): Promise<PersonalNote[]> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }
    return await findPersonalNotesByUserId(userId, filters);
};

export const updatePersonalNote = async (
    userId: string,
    noteId: string,
    data: { title?: string; content?: string | null; is_favorite?: boolean }
): Promise<PersonalNote> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const updated = await updatePersonalNoteInDB(noteId, userId, data);
    if (!updated) {
        throw new ApiError("Personal note not found", 404, [
            { field: "note", message: "Note not found or access denied" }
        ]);
    }
    return updated;
};

export const deletePersonalNote = async (
    userId: string,
    noteId: string
): Promise<{ id: string }> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const deleted = await deletePersonalNoteInDB(noteId, userId);
    if (!deleted) {
        throw new ApiError("Personal note not found", 404, [
            { field: "note", message: "Note not found or access denied" }
        ]);
    }
    return { id: noteId };
};
