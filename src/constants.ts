export const sendEmailENUM = {
    REGISTER: "REGISTER",
    FORGOT_PASSWORD: "FORGOT_PASSWORD",
    RESET_PASSWORD: "RESET_PASSWORD"
};

export const WORKSPACE_TYPE = {
    SOLO: "SOLO",
    TEAM: "TEAM"
} as const;

export type WorkspaceType = (typeof WORKSPACE_TYPE)[keyof typeof WORKSPACE_TYPE];

export const WORKSPACE_ROLE = {
    OWNER: "OWNER",
    ADMIN: "ADMIN",
    MEMBER: "MEMBER",
    VIEWER: "VIEWER"
} as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLE)[keyof typeof WORKSPACE_ROLE];

export const PROJECT_STATUS = {
    PLANNING: "PLANNING",
    ACTIVE: "ACTIVE",
    IN_PROGRESS: "IN_PROGRESS",
    PAUSED: "PAUSED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED"
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const PERSONAL_WORKSPACE_PROJECT_LIMIT = 10;

export const TASK_STATUS = {
    TODO: "TODO",
    IN_PROGRESS: "IN_PROGRESS",
    REVIEW: "REVIEW",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED"
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH"
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export const RESOURCE_CATEGORY = {
    FIGMA: "FIGMA",
    DOCS: "DOCS",
    DRIVE: "DRIVE",
    NOTION: "NOTION",
    DESIGN: "DESIGN",
    REFERENCE: "REFERENCE",
    OTHER: "OTHER"
} as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORY)[keyof typeof RESOURCE_CATEGORY];

export const ACTIVITY_ACTION = {
    PROJECT_CREATED: "PROJECT_CREATED",
    PROJECT_UPDATED: "PROJECT_UPDATED",
    PROJECT_DELETED: "PROJECT_DELETED",
    TASK_CREATED: "TASK_CREATED",
    TASK_UPDATED: "TASK_UPDATED",
    TASK_COMPLETED: "TASK_COMPLETED",
    TASK_DELETED: "TASK_DELETED",
    FILE_UPLOADED: "FILE_UPLOADED",
    FILE_DELETED: "FILE_DELETED",
    RESOURCE_CREATED: "RESOURCE_CREATED",
    RESOURCE_UPDATED: "RESOURCE_UPDATED",
    RESOURCE_DELETED: "RESOURCE_DELETED",
    GITHUB_REPO_CONNECTED: "GITHUB_REPO_CONNECTED",
    GITHUB_REPO_DISCONNECTED: "GITHUB_REPO_DISCONNECTED",
    GITHUB_PUSH: "GITHUB_PUSH"
} as const;

export type ActivityAction = (typeof ACTIVITY_ACTION)[keyof typeof ACTIVITY_ACTION];

export const ENTITY_TYPE = {
    PROJECT: "PROJECT",
    TASK: "TASK",
    FILE: "FILE",
    RESOURCE: "RESOURCE",
    GITHUB_REPO: "GITHUB_REPO",
    VAULT_ITEM: "VAULT_ITEM"
} as const;

export type EntityType = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];


export interface RouteRateLimitRule {
    limit: number;
    windowSeconds: number;
    routeName: string;
}

export const RATE_LIMIT_CONFIG: Record<string, RouteRateLimitRule> = {
    "/api/auth/login": {
        limit: 10,
        windowSeconds: 60,
        routeName: "login"
    },
    "/api/auth/register": {
        limit: 5,
        windowSeconds: 60,
        routeName: "register"
    },
    "/api/auth/forgot-password": {
        limit: 3,
        windowSeconds: 60,
        routeName: "forgot-password"
    },
    "/api/auth/reset-password": {
        limit: 5,
        windowSeconds: 60,
        routeName: "reset-password"
    },
    "/api/auth/google": {
        limit: 5,
        windowSeconds: 60,
        routeName: "google-oauth"
    },
    "/api/auth/google-oauth": {
        limit: 5,
        windowSeconds: 60,
        routeName: "google-oauth"
    },
    "/api/google-oauth": {
        limit: 5,
        windowSeconds: 60,
        routeName: "google-oauth"
    },
    "/api/auth/github": {
        limit: 5,
        windowSeconds: 60,
        routeName: "github-oauth"
    },
    "/api/auth/github-oauth": {
        limit: 5,
        windowSeconds: 60,
        routeName: "github-oauth"
    }
};