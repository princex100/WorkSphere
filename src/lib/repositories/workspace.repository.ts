import pool from "../db";
import { Workspace, WorkspaceMember, WorkspaceWithRole } from "@/types/workspace.type";

export const findWorkspaceById = async (workspaceId: string): Promise<Workspace | null> => {
    const result = await pool.query(
        `SELECT id, name, type, created_by, created_at, updated_at
         FROM workspaces
         WHERE id = $1`,
        [workspaceId]
    );
    return result.rows[0] ?? null;
};

export const findUserWorkspaces = async (userId: string): Promise<WorkspaceWithRole[]> => {
    const result = await pool.query(
        `SELECT w.id, w.name, w.type, w.created_by, w.created_at, w.updated_at, wm.role
         FROM workspaces w
         INNER JOIN workspace_members wm ON wm.workspace_id = w.id
         WHERE wm.user_id = $1
         ORDER BY w.created_at ASC`,
        [userId]
    );
    return result.rows;
};

export const findPersonalWorkspaceByUserId = async (
    userId: string
): Promise<WorkspaceWithRole | null> => {
    const result = await pool.query(
        `SELECT w.id, w.name, w.type, w.created_by, w.created_at, w.updated_at, wm.role
         FROM workspaces w
         INNER JOIN workspace_members wm ON wm.workspace_id = w.id
         WHERE wm.user_id = $1
         ORDER BY (w.created_by = $1) DESC, w.created_at ASC
         LIMIT 1`,
        [userId]
    );
    return result.rows[0] ?? null;
};

export const findWorkspaceMember = async (
    workspaceId: string,
    userId: string
): Promise<WorkspaceMember | null> => {
    const result = await pool.query(
        `SELECT id, workspace_id, user_id, role, created_at, updated_at
         FROM workspace_members
         WHERE workspace_id = $1 AND user_id = $2`,
        [workspaceId, userId]
    );
    return result.rows[0] ?? null;
};

export const createWorkspaceInDB = async (
    name: string,
    type: string,
    userId: string
): Promise<WorkspaceWithRole> => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const workspaceResult = await client.query(
            `INSERT INTO workspaces (name, type, created_by)
             VALUES ($1, $2, $3)
             RETURNING id, name, type, created_by, created_at, updated_at`,
            [name, type, userId]
        );

        const workspace = workspaceResult.rows[0];

        await client.query(
            `INSERT INTO workspace_members (workspace_id, user_id, role)
             VALUES ($1, $2, 'OWNER')`,
            [workspace.id, userId]
        );

        await client.query("COMMIT");

        return {
            ...workspace,
            role: "OWNER"
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
