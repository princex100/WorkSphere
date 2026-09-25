import pool from "../db";
import { PersonalFile, PersonalLink, PersonalNote } from "@/types/vault.type";

export const getVaultPasswordHash = async (userId: string): Promise<string | null> => {
    const result = await pool.query(
        `SELECT vault_password_hash FROM personal_vault_settings WHERE user_id = $1`,
        [userId]
    );
    return result.rows[0]?.vault_password_hash ?? null;
};

export const setVaultPasswordHash = async (
    userId: string,
    passwordHash: string
): Promise<boolean> => {
    const result = await pool.query(
        `INSERT INTO personal_vault_settings (user_id, vault_password_hash, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id)
         DO UPDATE SET vault_password_hash = $2, updated_at = CURRENT_TIMESTAMP
         RETURNING user_id`,
        [userId, passwordHash]
    );
    return (result.rowCount ?? 0) > 0;
};

// ==================== PERSONAL FILES ====================

export const createPersonalFileInDB = async (data: {
    user_id: string;
    name: string;
    cloudinary_url: string;
    cloudinary_public_id: string;
    resource_type?: string;
    mime_type?: string | null;
    file_size?: number;
    is_favorite?: boolean;
}): Promise<PersonalFile> => {
    const result = await pool.query(
        `INSERT INTO personal_files (
            user_id, name, cloudinary_url, cloudinary_public_id, resource_type, mime_type, file_size, is_favorite
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, user_id, name, cloudinary_url, cloudinary_public_id, resource_type, mime_type, file_size, is_favorite, created_at, updated_at`,
        [
            data.user_id,
            data.name,
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

export const findPersonalFilesByUserId = async (
    userId: string,
    filters: { search?: string; is_favorite?: boolean } = {}
): Promise<PersonalFile[]> => {
    const values: (string | boolean)[] = [userId];
    let paramIndex = 2;
    const conditions: string[] = ["user_id = $1"];

    if (filters.is_favorite !== undefined) {
        conditions.push(`is_favorite = $${paramIndex++}`);
        values.push(filters.is_favorite);
    }

    if (filters.search) {
        conditions.push(`name ILIKE $${paramIndex}`);
        values.push(`%${filters.search}%`);
        paramIndex++;
    }

    const query = `
        SELECT id, user_id, name, cloudinary_url, cloudinary_public_id, resource_type, mime_type, file_size, is_favorite, created_at, updated_at
        FROM personal_files
        WHERE ${conditions.join(" AND ")}
        ORDER BY is_favorite DESC, created_at DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
};

export const findPersonalFileById = async (
    fileId: string,
    userId: string
): Promise<PersonalFile | null> => {
    const result = await pool.query(
        `SELECT id, user_id, name, cloudinary_url, cloudinary_public_id, resource_type, mime_type, file_size, is_favorite, created_at, updated_at
         FROM personal_files
         WHERE id = $1 AND user_id = $2`,
        [fileId, userId]
    );
    return result.rows[0] ?? null;
};

export const updatePersonalFileInDB = async (
    fileId: string,
    userId: string,
    data: { name?: string; is_favorite?: boolean }
): Promise<PersonalFile | null> => {
    const hasFavorite = data.is_favorite !== undefined;

    const result = await pool.query(
        `UPDATE personal_files
         SET
            name = COALESCE($3, name),
            is_favorite = CASE WHEN $4::BOOLEAN THEN $5::BOOLEAN ELSE is_favorite END,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2
         RETURNING id, user_id, name, cloudinary_url, cloudinary_public_id, resource_type, mime_type, file_size, is_favorite, created_at, updated_at`,
        [fileId, userId, data.name || null, hasFavorite, data.is_favorite ?? false]
    );
    return result.rows[0] ?? null;
};

export const deletePersonalFileInDB = async (
    fileId: string,
    userId: string
): Promise<boolean> => {
    const result = await pool.query(
        `DELETE FROM personal_files WHERE id = $1 AND user_id = $2 RETURNING id`,
        [fileId, userId]
    );
    return (result.rowCount ?? 0) > 0;
};

// ==================== PERSONAL LINKS ====================

export const createPersonalLinkInDB = async (data: {
    user_id: string;
    name: string;
    url: string;
    description?: string | null;
    is_favorite?: boolean;
}): Promise<PersonalLink> => {
    const result = await pool.query(
        `INSERT INTO personal_links (user_id, name, url, description, is_favorite)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, name, url, description, is_favorite, created_at, updated_at`,
        [data.user_id, data.name, data.url, data.description ?? null, data.is_favorite ?? false]
    );
    return result.rows[0];
};

export const findPersonalLinksByUserId = async (
    userId: string,
    filters: { search?: string; is_favorite?: boolean } = {}
): Promise<PersonalLink[]> => {
    const values: (string | boolean)[] = [userId];
    let paramIndex = 2;
    const conditions: string[] = ["user_id = $1"];

    if (filters.is_favorite !== undefined) {
        conditions.push(`is_favorite = $${paramIndex++}`);
        values.push(filters.is_favorite);
    }

    if (filters.search) {
        conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
        values.push(`%${filters.search}%`);
        paramIndex++;
    }

    const query = `
        SELECT id, user_id, name, url, description, is_favorite, created_at, updated_at
        FROM personal_links
        WHERE ${conditions.join(" AND ")}
        ORDER BY is_favorite DESC, created_at DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
};

export const findPersonalLinkById = async (
    linkId: string,
    userId: string
): Promise<PersonalLink | null> => {
    const result = await pool.query(
        `SELECT id, user_id, name, url, description, is_favorite, created_at, updated_at
         FROM personal_links
         WHERE id = $1 AND user_id = $2`,
        [linkId, userId]
    );
    return result.rows[0] ?? null;
};

export const updatePersonalLinkInDB = async (
    linkId: string,
    userId: string,
    data: { name?: string; url?: string; description?: string | null; is_favorite?: boolean }
): Promise<PersonalLink | null> => {
    const hasDescription = data.description !== undefined;
    const hasFavorite = data.is_favorite !== undefined;

    const result = await pool.query(
        `UPDATE personal_links
         SET
            name = COALESCE($3, name),
            url = COALESCE($4, url),
            description = CASE WHEN $5::BOOLEAN THEN $6 ELSE description END,
            is_favorite = CASE WHEN $7::BOOLEAN THEN $8::BOOLEAN ELSE is_favorite END,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2
         RETURNING id, user_id, name, url, description, is_favorite, created_at, updated_at`,
        [linkId, userId, data.name || null, data.url || null, hasDescription, data.description ?? null, hasFavorite, data.is_favorite ?? false]
    );
    return result.rows[0] ?? null;
};

export const deletePersonalLinkInDB = async (
    linkId: string,
    userId: string
): Promise<boolean> => {
    const result = await pool.query(
        `DELETE FROM personal_links WHERE id = $1 AND user_id = $2 RETURNING id`,
        [linkId, userId]
    );
    return (result.rowCount ?? 0) > 0;
};

// ==================== PERSONAL NOTES ====================

export const createPersonalNoteInDB = async (data: {
    user_id: string;
    title: string;
    content?: string | null;
    is_favorite?: boolean;
}): Promise<PersonalNote> => {
    const result = await pool.query(
        `INSERT INTO personal_notes (user_id, title, content, is_favorite)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, title, content, is_favorite, created_at, updated_at`,
        [data.user_id, data.title, data.content ?? null, data.is_favorite ?? false]
    );
    return result.rows[0];
};

export const findPersonalNotesByUserId = async (
    userId: string,
    filters: { search?: string; is_favorite?: boolean } = {}
): Promise<PersonalNote[]> => {
    const values: (string | boolean)[] = [userId];
    let paramIndex = 2;
    const conditions: string[] = ["user_id = $1"];

    if (filters.is_favorite !== undefined) {
        conditions.push(`is_favorite = $${paramIndex++}`);
        values.push(filters.is_favorite);
    }

    if (filters.search) {
        conditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
        values.push(`%${filters.search}%`);
        paramIndex++;
    }

    const query = `
        SELECT id, user_id, title, content, is_favorite, created_at, updated_at
        FROM personal_notes
        WHERE ${conditions.join(" AND ")}
        ORDER BY is_favorite DESC, created_at DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
};

export const findPersonalNoteById = async (
    noteId: string,
    userId: string
): Promise<PersonalNote | null> => {
    const result = await pool.query(
        `SELECT id, user_id, title, content, is_favorite, created_at, updated_at
         FROM personal_notes
         WHERE id = $1 AND user_id = $2`,
        [noteId, userId]
    );
    return result.rows[0] ?? null;
};

export const updatePersonalNoteInDB = async (
    noteId: string,
    userId: string,
    data: { title?: string; content?: string | null; is_favorite?: boolean }
): Promise<PersonalNote | null> => {
    const hasContent = data.content !== undefined;
    const hasFavorite = data.is_favorite !== undefined;

    const result = await pool.query(
        `UPDATE personal_notes
         SET
            title = COALESCE($3, title),
            content = CASE WHEN $4::BOOLEAN THEN $5 ELSE content END,
            is_favorite = CASE WHEN $6::BOOLEAN THEN $7::BOOLEAN ELSE is_favorite END,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2
         RETURNING id, user_id, title, content, is_favorite, created_at, updated_at`,
        [noteId, userId, data.title || null, hasContent, data.content ?? null, hasFavorite, data.is_favorite ?? false]
    );
    return result.rows[0] ?? null;
};

export const deletePersonalNoteInDB = async (
    noteId: string,
    userId: string
): Promise<boolean> => {
    const result = await pool.query(
        `DELETE FROM personal_notes WHERE id = $1 AND user_id = $2 RETURNING id`,
        [noteId, userId]
    );
    return (result.rowCount ?? 0) > 0;
};

export const getVaultCountsByUserId = async (
    userId: string
): Promise<{ files: number; links: number; notes: number }> => {
    const fileRes = await pool.query(
        `SELECT COUNT(*)::INT AS count FROM personal_files WHERE user_id = $1`,
        [userId]
    );
    const linkRes = await pool.query(
        `SELECT COUNT(*)::INT AS count FROM personal_links WHERE user_id = $1`,
        [userId]
    );
    const noteRes = await pool.query(
        `SELECT COUNT(*)::INT AS count FROM personal_notes WHERE user_id = $1`,
        [userId]
    );

    return {
        files: fileRes.rows[0]?.count ?? 0,
        links: linkRes.rows[0]?.count ?? 0,
        notes: noteRes.rows[0]?.count ?? 0
    };
};
