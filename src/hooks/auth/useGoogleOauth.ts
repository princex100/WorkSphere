"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { googleOauth } from "@/lib/api/auth.api";

/**
 * useGoogleOauth
 * Receives the Google credential string from @react-oauth/google's
 * useGoogleLogin / GoogleLogin component, sends it to the backend,
 * and on success primes the user cache and redirects.
 */
export function useGoogleOauth() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (credential: string) => googleOauth(credential),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["current-user"] });
            router.push("/workspaces");
        },
    });
}
