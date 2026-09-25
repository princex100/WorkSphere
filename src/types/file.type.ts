export interface ProjectFile {
    id: string;
    project_id: string;
    uploaded_by: string;
    original_name: string;
    cloudinary_url: string;
    cloudinary_public_id: string;
    resource_type: string;
    mime_type: string | null;
    file_size: number;
    is_favorite: boolean;
    created_at: Date;
    updated_at: Date;
    uploader_name?: string;
}
