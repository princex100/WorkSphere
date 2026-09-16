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
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED"
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];


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