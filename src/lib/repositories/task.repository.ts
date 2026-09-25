import pool from "../db";
import { Task } from "@/types/task.type";

export interface CreateTaskInput {
    workspace_id: string;
    project_id?: string | null;
    parent_task_id?: string | null;
    created_by: string;
    assigned_to?: string | null;
    title: string;
    description?: string | null;
    status?: string;
    priority?: string;
    due_date?: Date | null;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    due_date?: Date | null;
    project_id?: string | null;
    parent_task_id?: string | null;
    assigned_to?: string | null;
    is_favorite?: boolean;
}

export interface TaskFilterOptions {
    project_id?: string | null;
    status?: string;
    priority?: string;
    is_favorite?: boolean;
    search?: string;
    only_personal?: boolean;
}

export const createTaskInDB = async (data: CreateTaskInput): Promise<Task> => {
    const result = await pool.query(
        `INSERT INTO tasks (
            workspace_id,
            project_id,
            parent_task_id,
            created_by,
            assigned_to,
            title,
            description,
            status,
            priority,
            due_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, workspace_id, project_id, parent_task_id, created_by, assigned_to,
                  title, description, status, priority, due_date, is_favorite, created_at, updated_at`,
        [
            data.workspace_id,
            data.project_id || null,
            data.parent_task_id || null,
            data.created_by,
            data.assigned_to || null,
            data.title,
            data.description ?? null,
            data.status || "TODO",
            data.priority || "MEDIUM",
            data.due_date ?? null
        ]
    );
    return result.rows[0];
};

export const findTasksByWorkspaceAndUser = async (
    workspaceId: string,
    filters: TaskFilterOptions = {}
): Promise<Task[]> => {
    const values: (string | boolean | number)[] = [workspaceId];
    let paramIndex = 2;
    const conditions: string[] = ["t.workspace_id = $1"];

    if (filters.only_personal) {
        conditions.push("t.project_id IS NULL");
    } else if (filters.project_id) {
        conditions.push(`t.project_id = $${paramIndex++}`);
        values.push(filters.project_id);
    }

    if (filters.status) {
        conditions.push(`t.status = $${paramIndex++}`);
        values.push(filters.status);
    }

    if (filters.priority) {
        conditions.push(`t.priority = $${paramIndex++}`);
        values.push(filters.priority);
    }

    if (filters.is_favorite !== undefined) {
        conditions.push(`t.is_favorite = $${paramIndex++}`);
        values.push(filters.is_favorite);
    }

    if (filters.search) {
        conditions.push(`(t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`);
        values.push(`%${filters.search}%`);
        paramIndex++;
    }

    const query = `
        SELECT
            t.id,
            t.workspace_id,
            t.project_id,
            t.parent_task_id,
            t.created_by,
            t.assigned_to,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.due_date,
            t.is_favorite,
            t.created_at,
            t.updated_at,
            p.name AS project_name,
            u.name AS creator_name
        FROM tasks t
        LEFT JOIN projects p ON p.id = t.project_id
        INNER JOIN users u ON u.id = t.created_by
        WHERE ${conditions.join(" AND ")}
        ORDER BY
            CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END,
            t.due_date ASC NULLS LAST,
            t.created_at DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
};

export const findTasksDueToday = async (workspaceId: string): Promise<Task[]> => {
    const result = await pool.query(
        `SELECT
            t.id,
            t.workspace_id,
            t.project_id,
            t.parent_task_id,
            t.created_by,
            t.assigned_to,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.due_date,
            t.is_favorite,
            t.created_at,
            t.updated_at,
            p.name AS project_name,
            u.name AS creator_name
         FROM tasks t
         LEFT JOIN projects p ON p.id = t.project_id
         INNER JOIN users u ON u.id = t.created_by
         WHERE t.workspace_id = $1
           AND t.due_date::DATE = CURRENT_DATE
         ORDER BY t.status = 'COMPLETED', t.priority DESC, t.created_at DESC`,
        [workspaceId]
    );
    return result.rows;
};

export const findUpcomingTasks = async (workspaceId: string): Promise<Task[]> => {
    const result = await pool.query(
        `SELECT
            t.id,
            t.workspace_id,
            t.project_id,
            t.parent_task_id,
            t.created_by,
            t.assigned_to,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.due_date,
            t.is_favorite,
            t.created_at,
            t.updated_at,
            p.name AS project_name,
            u.name AS creator_name
         FROM tasks t
         LEFT JOIN projects p ON p.id = t.project_id
         INNER JOIN users u ON u.id = t.created_by
         WHERE t.workspace_id = $1
           AND t.due_date::DATE > CURRENT_DATE
         ORDER BY t.due_date ASC, t.created_at DESC`,
        [workspaceId]
    );
    return result.rows;
};

export const findTaskById = async (taskId: string): Promise<Task | null> => {
    const result = await pool.query(
        `SELECT
            t.id,
            t.workspace_id,
            t.project_id,
            t.parent_task_id,
            t.created_by,
            t.assigned_to,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.due_date,
            t.is_favorite,
            t.created_at,
            t.updated_at,
            p.name AS project_name,
            u.name AS creator_name
         FROM tasks t
         LEFT JOIN projects p ON p.id = t.project_id
         INNER JOIN users u ON u.id = t.created_by
         WHERE t.id = $1`,
        [taskId]
    );
    return result.rows[0] ?? null;
};

export const findSubtasksByParentId = async (parentTaskId: string): Promise<Task[]> => {
    const result = await pool.query(
        `SELECT
            t.id,
            t.workspace_id,
            t.project_id,
            t.parent_task_id,
            t.created_by,
            t.assigned_to,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.due_date,
            t.is_favorite,
            t.created_at,
            t.updated_at
         FROM tasks t
         WHERE t.parent_task_id = $1
         ORDER BY t.created_at ASC`,
        [parentTaskId]
    );
    return result.rows;
};

export const updateTaskInDB = async (
    taskId: string,
    data: UpdateTaskInput
): Promise<Task | null> => {
    const hasDescription = data.description !== undefined;
    const hasDueDate = data.due_date !== undefined;
    const hasProjectId = data.project_id !== undefined;
    const hasParentTaskId = data.parent_task_id !== undefined;
    const hasAssignedTo = data.assigned_to !== undefined;
    const hasIsFavorite = data.is_favorite !== undefined;

    const result = await pool.query(
        `UPDATE tasks
         SET
            title = COALESCE($2, title),
            description = CASE WHEN $3::BOOLEAN THEN $4 ELSE description END,
            status = COALESCE($5, status),
            priority = COALESCE($6, priority),
            due_date = CASE WHEN $7::BOOLEAN THEN $8::TIMESTAMP ELSE due_date END,
            project_id = CASE WHEN $9::BOOLEAN THEN $10::UUID ELSE project_id END,
            parent_task_id = CASE WHEN $11::BOOLEAN THEN $12::UUID ELSE parent_task_id END,
            assigned_to = CASE WHEN $13::BOOLEAN THEN $14::UUID ELSE assigned_to END,
            is_favorite = CASE WHEN $15::BOOLEAN THEN $16::BOOLEAN ELSE is_favorite END,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING id, workspace_id, project_id, parent_task_id, created_by, assigned_to,
                   title, description, status, priority, due_date, is_favorite, created_at, updated_at`,
        [
            taskId,
            data.title || null,
            hasDescription,
            data.description ?? null,
            data.status || null,
            data.priority || null,
            hasDueDate,
            data.due_date ?? null,
            hasProjectId,
            data.project_id ?? null,
            hasParentTaskId,
            data.parent_task_id ?? null,
            hasAssignedTo,
            data.assigned_to ?? null,
            hasIsFavorite,
            data.is_favorite ?? false
        ]
    );
    return result.rows[0] ?? null;
};

export const deleteTaskInDB = async (taskId: string): Promise<boolean> => {
    const result = await pool.query(
        `DELETE FROM tasks WHERE id = $1 RETURNING id`,
        [taskId]
    );
    return (result.rowCount ?? 0) > 0;
};
