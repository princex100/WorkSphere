export interface GitHubIntegration {
    id: string;
    user_id: string;
    github_user_id: string;
    github_username: string;
    avatar_url: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface ProjectGitHubRepository {
    id: string;
    project_id: string;
    repo_id: string;
    repo_name: string;
    repo_owner: string;
    repo_url: string;
    default_branch: string;
    created_at: Date;
    updated_at: Date;
}

export interface GitHubRepoItem {
    id: number;
    name: string;
    full_name: string;
    owner: string;
    html_url: string;
    description: string | null;
    private: boolean;
    default_branch: string;
    language: string | null;
    updated_at: string;
}
