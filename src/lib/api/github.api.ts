import api from "@/lib/auth/axios";
import { GitHubIntegration, GitHubRepoItem } from "@/types/github.type";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export async function getGitHubIntegration(): Promise<GitHubIntegration | null> {
    const res = await api.get<ApiResponse<GitHubIntegration | null>>("/integrations/github");
    return res.data.data;
}

export async function connectGitHub(code: string): Promise<GitHubIntegration> {
    const res = await api.post<ApiResponse<GitHubIntegration>>("/integrations/github/connect", { code });
    return res.data.data;
}

export async function disconnectGitHub(): Promise<void> {
    await api.delete("/integrations/github");
}

export async function getGitHubRepositories(): Promise<GitHubRepoItem[]> {
    const res = await api.get<ApiResponse<GitHubRepoItem[]>>("/integrations/github/repositories");
    return res.data.data;
}
