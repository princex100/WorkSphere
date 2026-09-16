import { z } from "zod";
import { WORKSPACE_TYPE } from "@/constants";

const createWorkspaceSchema = z.object({
    name: z
        .string({ message: "Workspace name is required" })
        .min(2, "Workspace name must be at least 2 characters")
        .max(100, "Workspace name too long")
        .trim(),
    type: z.enum([WORKSPACE_TYPE.SOLO, WORKSPACE_TYPE.TEAM]).optional().default(WORKSPACE_TYPE.SOLO)
});

export const createWorkspaceValidator = (data: unknown) => {
    const result = createWorkspaceSchema.safeParse(data);

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
