import { WorkspaceRole, WorkspaceType } from "@/constants";

export interface Workspace {
    id: string;
    name: string;
    type: WorkspaceType;
    created_by: string;
    created_at: Date;
    updated_at: Date;
}

export interface WorkspaceMember {
    id: string;
    workspace_id: string;
    user_id: string;
    role: WorkspaceRole;
    created_at: Date;
    updated_at: Date;
}

export interface WorkspaceWithRole extends Workspace {
    role: WorkspaceRole;
    member_count?: number;
}
