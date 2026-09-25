import pool from "../db";
import { ProjectResource } from "@/types/resource.type";

export interface CreateResourceInput {
    project_id: string;
    created_by: string;
    name: string;
    url: string;
    description?: string | null;
    category?: string;
    is_favorite?: boolean;
}

export interface UpdateResourceInput {
    name?: string;
    url?: string;
    description?: string | null;
    category?: string;
    is_favorite?: boolean;
}

export interface ResourceFilterOptions {
    category?: string;
    search?: string;
    is_favorite?: boolean;
}

export const createResourceInDB = async (data: CreateResourceInput): Promise<ProjectResource> => {
    const result = await pool.query(
        `INSERT INTO project_resources (
            project_id,
            created_by,
            name,
            url,
            description,
            category,
            is_favorite
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, project_id, created_by, name, url, description, category, is_favorite, created_at, updated_at`,
        [
            data.project_id,
            data.created_by,
            data.name,
            data.url,
            data.description ?? null,
            data.category || "OTHER",
            data.is_favorite ?? false
        ]
    );
    return result.rows[0];
};

export const findResourcesByProjectId = async (
    projectId: string,
    filters: ResourceFilterOptions = {}
): Promise<ProjectResource[]> => {
    const values: (string | boolean)[] = [projectId];
    let paramIndex = 2;
    const conditions: string[] = ["r.project_id = $1"];

    if (filters.category) {
        conditions.push(`r.category = $${paramIndex++}`);
        values.push(filters.category);
    }

    if (filters.is_favorite !== undefined) {
        conditions.push(`r.is_favorite = $${paramIndex++}`);
        values.push(filters.is_favorite);
    }

    if (filters.search) {
        conditions.push(`(r.name ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`);
        values.push(`%${filters.search}%`);
        paramIndex++;
    }

    const query = `
        SELECT
            r.id,
            r.project_id,
            r.created_by,
            r.name,
            r.url,
            r.description,
            r.category,
            r.is_favorite,
            r.created_at,
            r.updated_at,
            u.name AS creator_name
        FROM project_resources r
        INNER JOIN users u ON u.id = r.created_by
        WHERE ${conditions.join(" AND ")}
        ORDER BY r.is_favorite DESC, r.created_at DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
};

export const findResourceById = async (resourceId: string): Promise<ProjectResource | null> => {
    const result = await pool.query(
        `SELECT
            r.id,
            r.project_id,
            r.created_by,
            r.name,
            r.url,
            r.description,
            r.category,
            r.is_favorite,
            r.created_at,
            r.updated_at,
            u.name AS creator_name
         FROM project_resources r
         INNER JOIN users u ON u.id = r.created_by
         WHERE r.id = $1`,
        [resourceId]
    );
    return result.rows[0] ?? null;
};

export const updateResourceInDB = async (
    resourceId: string,
    data: UpdateResourceInput
): Promise<ProjectResource | null> => {
    const hasDescription = data.description !== undefined;
    const hasIsFavorite = data.is_favorite !== undefined;

    const result = await pool.query(
        `UPDATE project_resources
         SET
            name = COALESCE($2, name),
            url = COALESCE($3, url),
            description = CASE WHEN $4::BOOLEAN THEN $5 ELSE description END,
            category = COALESCE($6, category),
            is_favorite = CASE WHEN $7::BOOLEAN THEN $8::BOOLEAN ELSE is_favorite END,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING id, project_id, created_by, name, url, description, category, is_favorite, created_at, updated_at`,
        [
            resourceId,
            data.name || null,
            data.url || null,
            hasDescription,
            data.description ?? null,
            data.category || null,
            hasIsFavorite,
            data.is_favorite ?? false
        ]
    );
    return result.rows[0] ?? null;
};

export const deleteResourceInDB = async (resourceId: string): Promise<boolean> => {
    const result = await pool.query(
        `DELETE FROM project_resources WHERE id = $1 RETURNING id`,
        [resourceId]
    );
    return (result.rowCount ?? 0) > 0;
};
