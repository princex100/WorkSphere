import { z } from "zod";

const connectGitHubSchema = z.object({
    code: z.string({ message: "GitHub OAuth code is required" }).min(1, "Code cannot be empty")
});

const linkRepoSchema = z.object({
    repo_id: z.string().or(z.number()).transform((val) => String(val)),
    repo_name: z.string({ message: "Repository name is required" }).min(1),
    repo_owner: z.string({ message: "Repository owner is required" }).min(1),
    repo_url: z.string({ message: "Repository URL is required" }).url("Must be a valid URL"),
    default_branch: z.string().optional().default("main")
});

export const connectGitHubValidator = (data: unknown) => {
    const result = connectGitHubSchema.safeParse(data);
    if (!result.success) {
        return {
            success: false as const,
            errors: result.error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
        };
    }
    return { success: true as const, data: result.data };
};

export const linkRepoValidator = (data: unknown) => {
    const result = linkRepoSchema.safeParse(data);
    if (!result.success) {
        return {
            success: false as const,
            errors: result.error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
        };
    }
    return { success: true as const, data: result.data };
};
