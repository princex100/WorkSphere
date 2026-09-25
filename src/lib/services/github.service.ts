import { ApiError } from "@/lib/errors/ApiError";
import axios from "axios";
import {
    saveGitHubIntegration,
    findGitHubIntegrationByUserId,
    deleteGitHubIntegrationByUserId,
    linkProjectGitHubRepoInDB,
    findProjectGitHubRepoInDB,
    deleteProjectGitHubRepoInDB,
    findProjectByGitHubRepoInDB
} from "../repositories/github.repository";
import { findProjectByIdAndUser } from "../repositories/project.repository";
import { verifyWorkspaceMembership } from "./workspace.service";
import { GitHubIntegration, GitHubRepoItem, ProjectGitHubRepository } from "@/types/github.type";
import { ACTIVITY_ACTION, ENTITY_TYPE } from "@/constants";
import { logActivity } from "./activity.service";

export const connectGitHubAccount = async (
    userId: string,
    code: string
): Promise<GitHubIntegration> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new ApiError("GitHub OAuth is not configured on server", 500, [
            { field: "github", message: "Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET" }
        ]);
    }

    // 1. Exchange code for access token
    let accessToken: string;
    try {
        const tokenRes = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: clientId,
                client_secret: clientSecret,
                code
            },
            {
                headers: { Accept: "application/json" }
            }
        );

        if (tokenRes.data.error || !tokenRes.data.access_token) {
            throw new Error(tokenRes.data.error_description || "Failed to exchange GitHub code for token");
        }

        accessToken = tokenRes.data.access_token;
    } catch (error: any) {
        throw new ApiError("GitHub OAuth exchange failed", 400, [
            { field: "code", message: error.message || "Failed to exchange GitHub OAuth code" }
        ]);
    }

    // 2. Fetch GitHub User Profile
    let githubUser: { id: number; login: string; avatar_url: string };
    try {
        const userRes = await axios.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json"
            }
        });
        githubUser = userRes.data;
    } catch (error: any) {
        throw new ApiError("Failed to fetch GitHub user details", 500, [
            { field: "github", message: "Could not retrieve user info from GitHub" }
        ]);
    }

    // 3. Save Integration
    return await saveGitHubIntegration({
        user_id: userId,
        github_user_id: String(githubUser.id),
        github_username: githubUser.login,
        access_token: accessToken,
        avatar_url: githubUser.avatar_url
    });
};

export const getConnectedGitHubAccount = async (
    userId: string
): Promise<GitHubIntegration | null> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }
    return await findGitHubIntegrationByUserId(userId, false);
};

export const disconnectGitHubAccount = async (userId: string): Promise<boolean> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }
    return await deleteGitHubIntegrationByUserId(userId);
};

export const getUserGitHubRepositories = async (userId: string): Promise<GitHubRepoItem[]> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const integration = await findGitHubIntegrationByUserId(userId, true);
    if (!integration || !integration.access_token) {
        throw new ApiError("GitHub account not connected", 400, [
            { field: "github", message: "Please connect your GitHub account first" }
        ]);
    }

    try {
        const res = await axios.get("https://api.github.com/user/repos?per_page=100&sort=updated", {
            headers: {
                Authorization: `Bearer ${integration.access_token}`,
                Accept: "application/vnd.github.v3+json"
            }
        });

        return res.data.map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            owner: repo.owner?.login,
            html_url: repo.html_url,
            description: repo.description,
            private: repo.private,
            default_branch: repo.default_branch || "main",
            language: repo.language,
            updated_at: repo.updated_at
        }));
    } catch (error: any) {
        throw new ApiError("Failed to fetch repositories from GitHub", 500, [
            { field: "github", message: error.message || "Failed to fetch repositories" }
        ]);
    }
};

export const linkRepositoryToProject = async (
    userId: string,
    projectId: string,
    data: {
        repo_id: string;
        repo_name: string;
        repo_owner: string;
        repo_url: string;
        default_branch?: string;
    }
): Promise<ProjectGitHubRepository> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const project = await findProjectByIdAndUser(projectId, userId);
    if (!project) {
        throw new ApiError("Project not found", 404, [
            { field: "project", message: "Project not found" }
        ]);
    }

    await verifyWorkspaceMembership(project.workspace_id, userId, ["OWNER", "ADMIN"]);

    const linked = await linkProjectGitHubRepoInDB({
        project_id: projectId,
        repo_id: data.repo_id,
        repo_name: data.repo_name,
        repo_owner: data.repo_owner,
        repo_url: data.repo_url,
        default_branch: data.default_branch
    });

    await logActivity({
        workspace_id: project.workspace_id,
        actor_id: userId,
        project_id: projectId,
        action: ACTIVITY_ACTION.GITHUB_REPO_CONNECTED,
        entity_type: ENTITY_TYPE.GITHUB_REPO,
        entity_id: linked.id,
        metadata: { repo_name: data.repo_name, repo_owner: data.repo_owner, repo_url: data.repo_url }
    });

    return linked;
};

export const getProjectGitHubRepository = async (
    userId: string,
    projectId: string
): Promise<ProjectGitHubRepository | null> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const project = await findProjectByIdAndUser(projectId, userId);
    if (!project) {
        throw new ApiError("Project not found", 404, [
            { field: "project", message: "Project not found" }
        ]);
    }

    await verifyWorkspaceMembership(project.workspace_id, userId);

    return await findProjectGitHubRepoInDB(projectId);
};

export const disconnectRepositoryFromProject = async (
    userId: string,
    projectId: string
): Promise<{ success: boolean }> => {
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Authentication required" }]);
    }

    const project = await findProjectByIdAndUser(projectId, userId);
    if (!project) {
        throw new ApiError("Project not found", 404, [
            { field: "project", message: "Project not found" }
        ]);
    }

    await verifyWorkspaceMembership(project.workspace_id, userId, ["OWNER", "ADMIN"]);

    const existing = await findProjectGitHubRepoInDB(projectId);
    if (!existing) {
        throw new ApiError("No GitHub repository linked to this project", 404, [
            { field: "github", message: "No repository connection found" }
        ]);
    }

    await deleteProjectGitHubRepoInDB(projectId);

    await logActivity({
        workspace_id: project.workspace_id,
        actor_id: userId,
        project_id: projectId,
        action: ACTIVITY_ACTION.GITHUB_REPO_DISCONNECTED,
        entity_type: ENTITY_TYPE.GITHUB_REPO,
        entity_id: existing.id,
        metadata: { repo_name: existing.repo_name, repo_owner: existing.repo_owner }
    });

    return { success: true };
};

export const handleGitHubWebhook = async (
    event: string,
    payload: any
): Promise<{ processed: boolean; reason?: string }> => {
    if (event !== "push") {
        return { processed: false, reason: `Ignored non-push event: ${event}` };
    }

    const repoOwner = payload.repository?.owner?.name || payload.repository?.owner?.login;
    const repoName = payload.repository?.name;

    if (!repoOwner || !repoName) {
        return { processed: false, reason: "Missing repository owner or name in payload" };
    }

    const linkedProject = await findProjectByGitHubRepoInDB(repoOwner, repoName);
    if (!linkedProject) {
        return { processed: false, reason: "No linked WorkSphere project found for this repository" };
    }

    const commitsCount = Array.isArray(payload.commits) ? payload.commits.length : 0;
    const pusherName = payload.pusher?.name || payload.sender?.login || "Someone";
    const ref = payload.ref || "main";

    // Insert activity log
    await logActivity({
        workspace_id: linkedProject.workspace_id,
        actor_id: payload.sender?.id ? String(payload.sender.id) : linkedProject.workspace_id, // fallback
        project_id: linkedProject.project_id,
        action: ACTIVITY_ACTION.GITHUB_PUSH,
        entity_type: ENTITY_TYPE.GITHUB_REPO,
        entity_id: null,
        metadata: {
            pusher: pusherName,
            commits_count: commitsCount,
            ref,
            head_commit_message: payload.head_commit?.message || null,
            repo_name: repoName,
            repo_owner: repoOwner
        }
    });

    return { processed: true };
};
