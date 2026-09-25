import { ResourceCategory } from "@/constants";

export interface ProjectResource {
    id: string;
    project_id: string;
    created_by: string;
    name: string;
    url: string;
    description: string | null;
    category: ResourceCategory;
    is_favorite: boolean;
    created_at: Date;
    updated_at: Date;
    creator_name?: string;
}
