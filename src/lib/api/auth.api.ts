import api from "@/lib/auth/axios";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
    credential: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    mobile?: string;
    country_code?: string;
}

export interface AuthResult {
    user: {
        id: string;
        name: string;
        email: string;
        username?: string;
        avatar_url: string;
        is_email_verified: boolean;
        global_role: string;
    };
}

// ── API Functions ─────────────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>("/auth/login", payload);
    return res.data.data;
}

export async function register(payload: RegisterPayload): Promise<{ message: string }> {
    const res = await api.post<ApiResponse<{ message: string }>>("/auth/register", payload);
    return res.data.data;
}

export async function logout(): Promise<void> {
    await api.post("/auth/logout");
}

export async function googleOauth(token: string): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>("/auth/google-oauth", { token });
    return res.data.data;
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
    const res = await api.post<ApiResponse<{ message: string }>>("/auth/verify-email", { token });
    return res.data.data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
    const res = await api.post<ApiResponse<{ message: string }>>("/auth/forgot-password", { email });
    return res.data.data;
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
    const res = await api.post<ApiResponse<{ message: string }>>("/auth/reset-password", { token, password });
    return res.data.data;
}
