import pool from "../db";
import { GitHubIntegration, ProjectGitHubRepository } from "@/types/github.type";

export const saveGitHubIntegration = async (data: {
    user_id: string;
    github_user_id: string;
    github_username: string;
    access_token: string;
    avatar_url?: string | null;
}): Promise<GitHubIntegration> => {
    const result = await pool.query(
        `INSERT INTO github_integrations (user_id, github_user_id, github_username, access_token, avatar_url, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id)
         DO UPDATE SET
            github_user_id = $2,
            github_username = $3,
            access_token = $4,
            avatar_url = $5,
            updated_at = CURRENT_TIMESTAMP
         RETURNING id, user_id, github_user_id, github_username, avatar_url, created_at, updated_at`,
        [data.user_id, data.github_user_id, data.github_username, data.access_token, data.avatar_url ?? null]
    );
    return result.rows[0];
};

export const findGitHubIntegrationByUserId = async (
    userId: string,
    includeToken: boolean = false
): Promise<(GitHubIntegration & { access_token?: string }) | null> => {
    const query = includeToken
        ? `SELECT id, user_id, github_user_id, github_username, access_token, avatar_url, created_at, updated_at
           FROM github_integrations WHERE user_id = $1`
        : `SELECT id, user_id, github_user_id, github_username, avatar_url, created_at, updated_at
           FROM github_integrations WHERE user_id = $1`;

    const result = await pool.query(query, [userId]);
    return result.rows[0] ?? null;
};

export const deleteGitHubIntegrationByUserId = async (userId: string): Promise<boolean> => {
    const result = await pool.query(
        `DELETE FROM github_integrations WHERE user_id = $1 RETURNING id`,
        [userId]
    );
    return (result.rowCount ?? 0) > 0;
};

export const linkProjectGitHubRepoInDB = async (data: {
    project_id: string;
    repo_id: string;
    repo_name: string;
    repo_owner: string;
    repo_url: string;
    default_branch?: string;
}): Promise<ProjectGitHubRepository> => {
    const result = await pool.query(
        `INSERT INTO project_github_repositories (
            project_id, repo_id, repo_name, repo_owner, repo_url, default_branch, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         ON CONFLICT (project_id)
         DO UPDATE SET
            repo_id = $2,
            repo_name = $3,
            repo_owner = $4,
            repo_url = $5,
            default_branch = $6,
            updated_at = CURRENT_TIMESTAMP
         RETURNING id, project_id, repo_id, repo_name, repo_owner, repo_url, default_branch, created_at, updated_at`,
        [
            data.project_id,
            data.repo_id,
            data.repo_name,
            data.repo_owner,
            data.repo_url,
            data.default_branch || "main"
        ]
    );
    return result.rows[0];
};

export const findProjectGitHubRepoInDB = async (
    projectId: string
): Promise<ProjectGitHubRepository | null> => {
    const result = await pool.query(
        `SELECT id, project_id, repo_id, repo_name, repo_owner, repo_url, default_branch, created_at, updated_at
         FROM project_github_repositories
         WHERE project_id = $1`,
        [projectId]
    );
    return result.rows[0] ?? null;
};

export const deleteProjectGitHubRepoInDB = async (projectId: string): Promise<boolean> => {
    const result = await pool.query(
        `DELETE FROM project_github_repositories WHERE project_id = $1 RETURNING id`,
        [projectId]
    );
    return (result.rowCount ?? 0) > 0;
};

export const findProjectByGitHubRepoInDB = async (
    repoOwner: string,
    repoName: string
): Promise<{ project_id: string; workspace_id: string; project_name: string } | null> => {
    const result = await pool.query(
        `SELECT pgr.project_id, p.workspace_id, p.name AS project_name
         FROM project_github_repositories pgr
         INNER JOIN projects p ON p.id = pgr.project_id
         WHERE LOWER(pgr.repo_owner) = LOWER($1) AND LOWER(pgr.repo_name) = LOWER($2)
         LIMIT 1`,
        [repoOwner, repoName]
    );
    return result.rows[0] ?? null;
};
