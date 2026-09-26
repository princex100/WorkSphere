"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth.api";

export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            // Clear all cached server state — user is signed out.
            queryClient.clear();
            router.push("/login");
        },
        onError: () => {
            // Even if the API call fails, clear local state and redirect.
            queryClient.clear();
            router.push("/login");
        },
    });
}
