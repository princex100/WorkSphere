"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, LoginPayload } from "@/lib/api/auth.api";

/**
 * useLogin
 * Calls POST /api/auth/login.
 * On success: backend sets HttpOnly cookies, then we invalidate current-user
 * which re-fetches and caches the user, then redirect to workspace selection.
 */
export function useLogin() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (payload: LoginPayload) => login(payload),
        onSuccess: async () => {
            // Invalidate and immediately re-fetch current-user.
            // This primes the cache before navigation so the workspace
            // selection page renders instantly.
            await queryClient.invalidateQueries({ queryKey: ["current-user"] });
            router.push("/workspaces");
        },
    });
}
