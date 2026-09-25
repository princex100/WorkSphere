import { z } from "zod";

const updateFileSchema = z.object({
    original_name: z
        .string()
        .min(1, "File name cannot be empty")
        .max(255, "File name cannot exceed 255 characters")
        .trim()
        .optional(),
    is_favorite: z.boolean().optional()
});

export const updateFileValidator = (data: unknown) => {
    const result = updateFileSchema.safeParse(data);
    if (!result.success) {
        const errors = result.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message
        }));
        return { success: false as const, errors };
    }
    return { success: true as const, data: result.data };
};
