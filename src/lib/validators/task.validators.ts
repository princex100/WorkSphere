import { z } from "zod";
import { TASK_STATUS, TASK_PRIORITY } from "@/constants";

const createTaskSchema = z.object({
    title: z
        .string({ message: "Task title is required" })
        .min(1, "Task title cannot be empty")
        .max(255, "Task title cannot exceed 255 characters")
        .trim(),
    description: z.string().max(5000, "Description too long").optional().nullable(),
    status: z
        .enum([
            TASK_STATUS.TODO,
            TASK_STATUS.IN_PROGRESS,
            TASK_STATUS.REVIEW,
            TASK_STATUS.COMPLETED,
            TASK_STATUS.CANCELLED
        ])
        .optional()
        .default(TASK_STATUS.TODO),
    priority: z
        .enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH])
        .optional()
        .default(TASK_PRIORITY.MEDIUM),
    due_date: z
        .string()
        .datetime({ message: "due_date must be a valid ISO datetime string" })
        .optional()
        .nullable(),
    project_id: z.string().uuid("Invalid project ID format").optional().nullable(),
    parent_task_id: z.string().uuid("Invalid parent task ID format").optional().nullable(),
    assigned_to: z.string().uuid("Invalid assigned user ID format").optional().nullable(),
    workspace_id: z.string().uuid("Invalid workspace ID format").optional()
});

const updateTaskSchema = z.object({
    title: z
        .string()
        .min(1, "Task title cannot be empty")
        .max(255, "Task title cannot exceed 255 characters")
        .trim()
        .optional(),
    description: z.string().max(5000, "Description too long").optional().nullable(),
    status: z
        .enum([
            TASK_STATUS.TODO,
            TASK_STATUS.IN_PROGRESS,
            TASK_STATUS.REVIEW,
            TASK_STATUS.COMPLETED,
            TASK_STATUS.CANCELLED
        ])
        .optional(),
    priority: z
        .enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH])
        .optional(),
    due_date: z
        .string()
        .datetime({ message: "due_date must be a valid ISO datetime string" })
        .optional()
        .nullable(),
    project_id: z.string().uuid("Invalid project ID format").optional().nullable(),
    parent_task_id: z.string().uuid("Invalid parent task ID format").optional().nullable(),
    assigned_to: z.string().uuid("Invalid assigned user ID format").optional().nullable(),
    is_favorite: z.boolean().optional()
});

const uuidSchema = z.string().uuid("Invalid UUID format");

export const createTaskValidator = (data: unknown) => {
    const result = createTaskSchema.safeParse(data);
    if (!result.success) {
        const errors = result.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message
        }));
        return { success: false as const, errors };
    }
    return { success: true as const, data: result.data };
};

export const updateTaskValidator = (data: unknown) => {
    const result = updateTaskSchema.safeParse(data);
    if (!result.success) {
        const errors = result.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message
        }));
        return { success: false as const, errors };
    }
    return { success: true as const, data: result.data };
};

export const uuidValidator = (id: string) => {
    const result = uuidSchema.safeParse(id);
    if (!result.success) {
        return {
            success: false as const,
            errors: [{ field: "id", message: "Invalid ID format. Must be a valid UUID." }]
        };
    }
    return { success: true as const, data: result.data };
};
