export interface PersonalFile {
    id: string;
    user_id: string;
    name: string;
    cloudinary_url: string;
    cloudinary_public_id: string;
    resource_type: string;
    mime_type: string | null;
    file_size: number;
    is_favorite: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface PersonalLink {
    id: string;
    user_id: string;
    name: string;
    url: string;
    description: string | null;
    is_favorite: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface PersonalNote {
    id: string;
    user_id: string;
    title: string;
    content: string | null;
    is_favorite: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface VaultSummary {
    is_locked: boolean;
    has_password: boolean;
    file_count: number;
    link_count: number;
    note_count: number;
}
