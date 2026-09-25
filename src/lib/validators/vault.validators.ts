import { z } from "zod";

const setVaultPasswordSchema = z.object({
    password: z
        .string({ message: "Password is required" })
        .min(6, "Vault password must be at least 6 characters")
        .max(100, "Vault password cannot exceed 100 characters"),
    current_password: z.string().optional()
});

const unlockVaultSchema = z.object({
    password: z.string({ message: "Password is required" }).min(1, "Password cannot be empty")
});

const createVaultLinkSchema = z.object({
    name: z
        .string({ message: "Link name is required" })
        .min(1, "Link name cannot be empty")
        .max(255, "Link name cannot exceed 255 characters")
        .trim(),
    url: z.string({ message: "URL is required" }).url("Must be a valid URL").trim(),
    description: z.string().max(2000, "Description too long").optional().nullable(),
    is_favorite: z.boolean().optional()
});

const updateVaultLinkSchema = z.object({
    name: z
        .string()
        .min(1, "Link name cannot be empty")
        .max(255, "Link name cannot exceed 255 characters")
        .trim()
        .optional(),
    url: z.string().url("Must be a valid URL").trim().optional(),
    description: z.string().max(2000, "Description too long").optional().nullable(),
    is_favorite: z.boolean().optional()
});

const createVaultNoteSchema = z.object({
    title: z
        .string({ message: "Title is required" })
        .min(1, "Title cannot be empty")
        .max(255, "Title cannot exceed 255 characters")
        .trim(),
    content: z.string().max(50000, "Content cannot exceed 50,000 characters").optional().nullable(),
    is_favorite: z.boolean().optional()
});

const updateVaultNoteSchema = z.object({
    title: z
        .string()
        .min(1, "Title cannot be empty")
        .max(255, "Title cannot exceed 255 characters")
        .trim()
        .optional(),
    content: z.string().max(50000, "Content cannot exceed 50,000 characters").optional().nullable(),
    is_favorite: z.boolean().optional()
});

const updateVaultFileSchema = z.object({
    name: z
        .string()
        .min(1, "File name cannot be empty")
        .max(255, "File name cannot exceed 255 characters")
        .trim()
        .optional(),
    is_favorite: z.boolean().optional()
});

export const setVaultPasswordValidator = (data: unknown) => {
    const result = setVaultPasswordSchema.safeParse(data);
    if (!result.success) {
        return {
            success: false as const,
            errors: result.error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
        };
    }
    return { success: true as const, data: result.data };
};

export const unlockVaultValidator = (data: unknown) => {
    const result = unlockVaultSchema.safeParse(data);
    if (!result.success) {
        return {
            success: false as const,
            errors: result.error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
        };
    }
    return { success: true as const, data: result.data };
};

export const createVaultLinkValidator = (data: unknown) => {
    const result = createVaultLinkSchema.safeParse(data);
    if (!result.success) {
        return {
            success: false as const,
            errors: result.error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
        };
    }
    return { success: true as const, data: result.data };
};

export const updateVaultLinkValidator = (data: unknown) => {
    const result = updateVaultLinkSchema.safeParse(data);
    if (!result.success) {
        return {
            success: false as const,
            errors: result.error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
        };
    }
    return { success: true as const, data: result.data };
};

export const createVaultNoteValidator = (data: unknown) => {
    const result = createVaultNoteSchema.safeParse(data);
    if (!result.success) {
        return {
            success: false as const,
            errors: result.error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
        };
    }
    return { success: true as const, data: result.data };
};

export const updateVaultNoteValidator = (data: unknown) => {
    const result = updateVaultNoteSchema.safeParse(data);
    if (!result.success) {
        return {
            success: false as const,
            errors: result.error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
        };
    }
    return { success: true as const, data: result.data };
};

export const updateVaultFileValidator = (data: unknown) => {
    const result = updateVaultFileSchema.safeParse(data);
    if (!result.success) {
        return {
            success: false as const,
            errors: result.error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
        };
    }
    return { success: true as const, data: result.data };
};
