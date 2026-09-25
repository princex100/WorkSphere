import { ActivityAction, EntityType } from "@/constants";

export interface ActivityLog {
    id: string;
    workspace_id: string;
    actor_id: string;
    project_id: string | null;
    action: ActivityAction;
    entity_type: EntityType;
    entity_id: string | null;
    metadata: Record<string, unknown>;
    created_at: Date;
    actor_name?: string;
    actor_avatar?: string;
    project_name?: string;
}
