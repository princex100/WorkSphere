import api from "@/lib/auth/axios";
import { PersonalFile, PersonalLink, PersonalNote, VaultSummary } from "@/types/vault.type";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

// ── Session ───────────────────────────────────────────────────────────────────

export async function getVaultSummary(): Promise<VaultSummary> {
    const res = await api.get<ApiResponse<VaultSummary>>("/vault/summary");
    return res.data.data;
}

export async function setVaultPassword(password: string): Promise<void> {
    await api.post("/vault/password", { password });
}

export async function unlockVault(password: string): Promise<void> {
    await api.post("/vault/unlock", { password });
}

export async function lockVault(): Promise<void> {
    await api.post("/vault/lock");
}

// ── Files ─────────────────────────────────────────────────────────────────────

export async function getVaultFiles(search?: string): Promise<PersonalFile[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await api.get<ApiResponse<PersonalFile[]>>(`/vault/files${params}`);
    return res.data.data;
}

export async function uploadVaultFile(file: File): Promise<PersonalFile> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<ApiResponse<PersonalFile>>("/vault/files", formData);
    return res.data.data;
}

export async function updateVaultFile(id: string, payload: { name?: string; is_favorite?: boolean }): Promise<PersonalFile> {
    const res = await api.patch<ApiResponse<PersonalFile>>(`/vault/files/${id}`, payload);
    return res.data.data;
}

export async function deleteVaultFile(id: string): Promise<void> {
    await api.delete(`/vault/files/${id}`);
}

// ── Links ─────────────────────────────────────────────────────────────────────

export async function getVaultLinks(search?: string): Promise<PersonalLink[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await api.get<ApiResponse<PersonalLink[]>>(`/vault/links${params}`);
    return res.data.data;
}

export async function createVaultLink(payload: { name: string; url: string; description?: string }): Promise<PersonalLink> {
    const res = await api.post<ApiResponse<PersonalLink>>("/vault/links", payload);
    return res.data.data;
}

export async function updateVaultLink(id: string, payload: { name?: string; url?: string; description?: string; is_favorite?: boolean }): Promise<PersonalLink> {
    const res = await api.patch<ApiResponse<PersonalLink>>(`/vault/links/${id}`, payload);
    return res.data.data;
}

export async function deleteVaultLink(id: string): Promise<void> {
    await api.delete(`/vault/links/${id}`);
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function getVaultNotes(search?: string): Promise<PersonalNote[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await api.get<ApiResponse<PersonalNote[]>>(`/vault/notes${params}`);
    return res.data.data;
}

export async function createVaultNote(payload: { title: string; content?: string }): Promise<PersonalNote> {
    const res = await api.post<ApiResponse<PersonalNote>>("/vault/notes", payload);
    return res.data.data;
}

export async function updateVaultNote(id: string, payload: { title?: string; content?: string; is_favorite?: boolean }): Promise<PersonalNote> {
    const res = await api.patch<ApiResponse<PersonalNote>>(`/vault/notes/${id}`, payload);
    return res.data.data;
}

export async function deleteVaultNote(id: string): Promise<void> {
    await api.delete(`/vault/notes/${id}`);
}
