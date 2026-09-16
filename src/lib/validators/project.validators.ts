import { z } from "zod";
import { PROJECT_STATUS } from "@/constants";

const createProjectSchema = z.object({
    name: z
        .string({ message: "Project name is required" })
        .min(2, "Project name must be at least 2 characters")
        .max(100, "Project name cannot exceed 100 characters")
        .trim(),
    description: z.string().max(2000, "Description too long").optional().nullable(),
    status: z
        .enum([
            PROJECT_STATUS.PLANNING,
            PROJECT_STATUS.ACTIVE,
            PROJECT_STATUS.COMPLETED,
            PROJECT_STATUS.CANCELLED
        ])
        .optional()
        .default(PROJECT_STATUS.PLANNING),
    start_date: z
        .string()
        .datetime({ message: "start_date must be a valid ISO datetime string" })
        .optional()
        .nullable(),
    due_date: z
        .string()
        .datetime({ message: "due_date must be a valid ISO datetime string" })
        .optional()
        .nullable(),
    workspace_id: z.string().uuid("Invalid workspace ID format").optional()
});

const updateProjectSchema = z.object({
    name: z
        .string()
        .min(2, "Project name must be at least 2 characters")
        .max(100, "Project name cannot exceed 100 characters")
        .trim()
        .optional(),
    description: z.string().max(2000, "Description too long").optional().nullable(),
    status: z
        .enum([
            PROJECT_STATUS.PLANNING,
            PROJECT_STATUS.ACTIVE,
            PROJECT_STATUS.COMPLETED,
            PROJECT_STATUS.CANCELLED
        ])
        .optional(),
    start_date: z
        .string()
        .datetime({ message: "start_date must be a valid ISO datetime string" })
        .optional()
        .nullable(),
    due_date: z
        .string()
        .datetime({ message: "due_date must be a valid ISO datetime string" })
        .optional()
        .nullable()
});

const uuidSchema = z.string().uuid("Invalid UUID format");

export const createProjectValidator = (data: unknown) => {
    const result = createProjectSchema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message
        }));

        return {
            success: false as const,
            errors
        };
    }

    return {
        success: true as const,
        data: result.data
    };
};

export const updateProjectValidator = (data: unknown) => {
    const result = updateProjectSchema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message
        }));

        return {
            success: false as const,
            errors
        };
    }

    return {
        success: true as const,
        data: result.data
    };
};

export const uuidValidator = (id: string) => {
    const result = uuidSchema.safeParse(id);
    if (!result.success) {
        return {
            success: false as const,
            errors: [{ field: "id", message: "Invalid ID format. Must be a valid UUID." }]
        };
    }
    return {
        success: true as const,
        data: result.data
    };
};
