import { z } from "zod";
import { RESOURCE_CATEGORY } from "@/constants";

const createResourceSchema = z.object({
    name: z
        .string({ message: "Resource name is required" })
        .min(1, "Resource name cannot be empty")
        .max(255, "Resource name cannot exceed 255 characters")
        .trim(),
    url: z
        .string({ message: "Resource URL is required" })
        .url("Must be a valid URL")
        .trim(),
    description: z.string().max(2000, "Description too long").optional().nullable(),
    category: z
        .enum([
            RESOURCE_CATEGORY.FIGMA,
            RESOURCE_CATEGORY.DOCS,
            RESOURCE_CATEGORY.DRIVE,
            RESOURCE_CATEGORY.NOTION,
            RESOURCE_CATEGORY.DESIGN,
            RESOURCE_CATEGORY.REFERENCE,
            RESOURCE_CATEGORY.OTHER
        ])
        .optional()
        .default(RESOURCE_CATEGORY.OTHER),
    is_favorite: z.boolean().optional()
});

const updateResourceSchema = z.object({
    name: z
        .string()
        .min(1, "Resource name cannot be empty")
        .max(255, "Resource name cannot exceed 255 characters")
        .trim()
        .optional(),
    url: z.string().url("Must be a valid URL").trim().optional(),
    description: z.string().max(2000, "Description too long").optional().nullable(),
    category: z
        .enum([
            RESOURCE_CATEGORY.FIGMA,
            RESOURCE_CATEGORY.DOCS,
            RESOURCE_CATEGORY.DRIVE,
            RESOURCE_CATEGORY.NOTION,
            RESOURCE_CATEGORY.DESIGN,
            RESOURCE_CATEGORY.REFERENCE,
            RESOURCE_CATEGORY.OTHER
        ])
        .optional(),
    is_favorite: z.boolean().optional()
});

export const createResourceValidator = (data: unknown) => {
    const result = createResourceSchema.safeParse(data);
    if (!result.success) {
        const errors = result.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message
        }));
        return { success: false as const, errors };
    }
    return { success: true as const, data: result.data };
};

export const updateResourceValidator = (data: unknown) => {
    const result = updateResourceSchema.safeParse(data);
    if (!result.success) {
        const errors = result.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message
        }));
        return { success: false as const, errors };
    }
    return { success: true as const, data: result.data };
};
