import pool from "../db";
import { Project, ProjectWithWorkspace } from "@/types/project.type";

export interface CreateProjectInput {
    workspace_id: string;
    created_by: string;
    name: string;
    description?: string | null;
    status?: string;
    start_date?: Date | null;
    due_date?: Date | null;
}

export interface UpdateProjectInput {
    name?: string;
    description?: string | null;
    status?: string;
    start_date?: Date | null;
    due_date?: Date | null;
}

export const createProjectInDB = async (data: CreateProjectInput): Promise<Project> => {
    const result = await pool.query(
        `INSERT INTO projects (
            workspace_id,
            created_by,
            name,
            description,
            status,
            start_date,
            due_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, workspace_id, created_by, name, description, status, start_date, due_date, created_at, updated_at`,
        [
            data.workspace_id,
            data.created_by,
            data.name,
            data.description ?? null,
            data.status || "PLANNING",
            data.start_date ?? null,
            data.due_date ?? null
        ]
    );
    return result.rows[0];
};

export const findProjectsByWorkspaceAndUser = async (
    userId: string,
    workspaceId?: string
): Promise<ProjectWithWorkspace[]> => {
    const result = await pool.query(
        `SELECT
            p.id,
            p.workspace_id,
            p.created_by,
            p.name,
            p.description,
            p.status,
            p.start_date,
            p.due_date,
            p.created_at,
            p.updated_at,
            w.name AS workspace_name
         FROM projects p
         INNER JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
         INNER JOIN workspaces w ON w.id = p.workspace_id
         WHERE wm.user_id = $1 AND ($2::UUID IS NULL OR p.workspace_id = $2)
         ORDER BY p.created_at DESC`,
        [userId, workspaceId || null]
    );
    return result.rows;
};

export const findProjectByIdAndUser = async (
    projectId: string,
    userId: string
): Promise<ProjectWithWorkspace | null> => {
    const result = await pool.query(
        `SELECT
            p.id,
            p.workspace_id,
            p.created_by,
            p.name,
            p.description,
            p.status,
            p.start_date,
            p.due_date,
            p.created_at,
            p.updated_at,
            w.name AS workspace_name
         FROM projects p
         INNER JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
         INNER JOIN workspaces w ON w.id = p.workspace_id
         WHERE p.id = $1 AND wm.user_id = $2`,
        [projectId, userId]
    );
    return result.rows[0] ?? null;
};

export const updateProjectInDB = async (
    projectId: string,
    userId: string,
    data: UpdateProjectInput
): Promise<Project | null> => {
    const hasDescription = data.description !== undefined;
    const hasStartDate = data.start_date !== undefined;
    const hasDueDate = data.due_date !== undefined;

    const result = await pool.query(
        `UPDATE projects
         SET
            name = COALESCE($3, name),
            description = CASE WHEN $4::BOOLEAN THEN $5 ELSE description END,
            status = COALESCE($6, status),
            start_date = CASE WHEN $7::BOOLEAN THEN $8::TIMESTAMP ELSE start_date END,
            due_date = CASE WHEN $9::BOOLEAN THEN $10::TIMESTAMP ELSE due_date END,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = $2
         )
         RETURNING id, workspace_id, created_by, name, description, status, start_date, due_date, created_at, updated_at`,
        [
            projectId,
            userId,
            data.name || null,
            hasDescription,
            data.description ?? null,
            data.status || null,
            hasStartDate,
            data.start_date ?? null,
            hasDueDate,
            data.due_date ?? null
        ]
    );
    return result.rows[0] ?? null;
};

export const deleteProjectInDB = async (
    projectId: string,
    userId: string
): Promise<boolean> => {
    const result = await pool.query(
        `DELETE FROM projects
         WHERE id = $1 AND workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = $2
         )
         RETURNING id`,
        [projectId, userId]
    );
    return (result.rowCount ?? 0) > 0;
};
