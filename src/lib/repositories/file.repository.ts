import pool from "../db";
import { ProjectFile } from "@/types/file.type";

export interface CreateProjectFileInput {
    project_id: string;
    uploaded_by: string;
    original_name: string;
    cloudinary_url: string;
    cloudinary_public_id: string;
    resource_type?: string;
    mime_type?: string | null;
    file_size?: number;
    is_favorite?: boolean;
}

export interface UpdateProjectFileInput {
    original_name?: string;
    is_favorite?: boolean;
}

export interface FileFilterOptions {
    search?: string;
    is_favorite?: boolean;
    resource_type?: string;
}

export const createProjectFileInDB = async (data: CreateProjectFileInput): Promise<ProjectFile> => {
    const result = await pool.query(
        `INSERT INTO project_files (
            project_id,
            uploaded_by,
            original_name,
            cloudinary_url,
            cloudinary_public_id,
            resource_type,
            mime_type,
            file_size,
            is_favorite
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, project_id, uploaded_by, original_name, cloudinary_url,
                  cloudinary_public_id, resource_type, mime_type, file_size, is_favorite, created_at, updated_at`,
        [
            data.project_id,
            data.uploaded_by,
            data.original_name,
            data.cloudinary_url,
            data.cloudinary_public_id,
            data.resource_type || "auto",
            data.mime_type ?? null,
            data.file_size || 0,
            data.is_favorite ?? false
        ]
    );
    return result.rows[0];
};

export const findProjectFilesByProjectId = async (
    projectId: string,
    filters: FileFilterOptions = {}
): Promise<ProjectFile[]> => {
    const values: (string | boolean)[] = [projectId];
    let paramIndex = 2;
    const conditions: string[] = ["f.project_id = $1"];

    if (filters.is_favorite !== undefined) {
        conditions.push(`f.is_favorite = $${paramIndex++}`);
        values.push(filters.is_favorite);
    }

    if (filters.resource_type) {
        conditions.push(`f.resource_type = $${paramIndex++}`);
        values.push(filters.resource_type);
    }

    if (filters.search) {
        conditions.push(`f.original_name ILIKE $${paramIndex}`);
        values.push(`%${filters.search}%`);
        paramIndex++;
    }

    const query = `
        SELECT
            f.id,
            f.project_id,
            f.uploaded_by,
            f.original_name,
            f.cloudinary_url,
            f.cloudinary_public_id,
            f.resource_type,
            f.mime_type,
            f.file_size,
            f.is_favorite,
            f.created_at,
            f.updated_at,
            u.name AS uploader_name
        FROM project_files f
        INNER JOIN users u ON u.id = f.uploaded_by
        WHERE ${conditions.join(" AND ")}
        ORDER BY f.is_favorite DESC, f.created_at DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
};

export const findProjectFileById = async (fileId: string): Promise<ProjectFile | null> => {
    const result = await pool.query(
        `SELECT
            f.id,
            f.project_id,
            f.uploaded_by,
            f.original_name,
            f.cloudinary_url,
            f.cloudinary_public_id,
            f.resource_type,
            f.mime_type,
            f.file_size,
            f.is_favorite,
            f.created_at,
            f.updated_at,
            u.name AS uploader_name
         FROM project_files f
         INNER JOIN users u ON u.id = f.uploaded_by
         WHERE f.id = $1`,
        [fileId]
    );
    return result.rows[0] ?? null;
};

export const updateProjectFileInDB = async (
    fileId: string,
    data: UpdateProjectFileInput
): Promise<ProjectFile | null> => {
    const hasFavorite = data.is_favorite !== undefined;

    const result = await pool.query(
        `UPDATE project_files
         SET
            original_name = COALESCE($2, original_name),
            is_favorite = CASE WHEN $3::BOOLEAN THEN $4::BOOLEAN ELSE is_favorite END,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING id, project_id, uploaded_by, original_name, cloudinary_url,
                   cloudinary_public_id, resource_type, mime_type, file_size, is_favorite, created_at, updated_at`,
        [
            fileId,
            data.original_name || null,
            hasFavorite,
            data.is_favorite ?? false
        ]
    );
    return result.rows[0] ?? null;
};

export const deleteProjectFileInDB = async (fileId: string): Promise<boolean> => {
    const result = await pool.query(
        `DELETE FROM project_files WHERE id = $1 RETURNING id`,
        [fileId]
    );
    return (result.rowCount ?? 0) > 0;
};
