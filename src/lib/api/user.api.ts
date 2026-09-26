import api from "@/lib/auth/axios";
import User from "@/types/user.type";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export async function getCurrentUser(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/users/current-user");
    return res.data.data;
}

export async function uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await api.post<ApiResponse<User>>("/users/avatar", formData);
    return res.data.data;
}

