import { ProjectStatus } from "@/constants";
import { ProjectGitHubRepository } from "./github.type";

export interface Project {
    id: string;
    workspace_id: string;
    created_by: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    start_date: Date | null;
    due_date: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface ProjectWithWorkspace extends Project {
    workspace_name?: string;
    github_repo?: ProjectGitHubRepository | null;
}
