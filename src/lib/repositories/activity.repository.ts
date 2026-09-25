import pool from "../db";
import { ActivityLog } from "@/types/activity.type";

export interface CreateActivityInput {
    workspace_id: string;
    actor_id: string;
    project_id?: string | null;
    action: string;
    entity_type: string;
    entity_id?: string | null;
    metadata?: Record<string, unknown>;
}

export const createActivityInDB = async (data: CreateActivityInput): Promise<ActivityLog> => {
    const result = await pool.query(
        `INSERT INTO activity_logs (
            workspace_id,
            actor_id,
            project_id,
            action,
            entity_type,
            entity_id,
            metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, workspace_id, actor_id, project_id, action, entity_type, entity_id, metadata, created_at`,
        [
            data.workspace_id,
            data.actor_id,
            data.project_id || null,
            data.action,
            data.entity_type,
            data.entity_id || null,
            JSON.stringify(data.metadata || {})
        ]
    );
    return result.rows[0];
};

export const findActivitiesByProjectId = async (
    projectId: string,
    limit: number = 50,
    offset: number = 0
): Promise<ActivityLog[]> => {
    const result = await pool.query(
        `SELECT
            a.id,
            a.workspace_id,
            a.actor_id,
            a.project_id,
            a.action,
            a.entity_type,
            a.entity_id,
            a.metadata,
            a.created_at,
            u.name AS actor_name,
            u.avatar_url AS actor_avatar,
            p.name AS project_name
         FROM activity_logs a
         INNER JOIN users u ON u.id = a.actor_id
         LEFT JOIN projects p ON p.id = a.project_id
         WHERE a.project_id = $1
         ORDER BY a.created_at DESC
         LIMIT $2 OFFSET $3`,
        [projectId, limit, offset]
    );
    return result.rows;
};

export const findRecentActivitiesByWorkspaceId = async (
    workspaceId: string,
    limit: number = 20
): Promise<ActivityLog[]> => {
    const result = await pool.query(
        `SELECT
            a.id,
            a.workspace_id,
            a.actor_id,
            a.project_id,
            a.action,
            a.entity_type,
            a.entity_id,
            a.metadata,
            a.created_at,
            u.name AS actor_name,
            u.avatar_url AS actor_avatar,
            p.name AS project_name
         FROM activity_logs a
         INNER JOIN users u ON u.id = a.actor_id
         LEFT JOIN projects p ON p.id = a.project_id
         WHERE a.workspace_id = $1
         ORDER BY a.created_at DESC
         LIMIT $2`,
        [workspaceId, limit]
    );
    return result.rows;
};
