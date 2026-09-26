"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { register, RegisterPayload } from "@/lib/api/auth.api";

/**
 * useRegister
 * Calls POST /api/auth/register.
 * On success: redirect to verify-email with a flag so the page shows the
 * "check your inbox" screen. No auto-login — user must verify first.
 */
export function useRegister() {
    const router = useRouter();

    return useMutation({
        mutationFn: (payload: RegisterPayload) => register(payload),
        onSuccess: () => {
            router.push("/verify-email?sent=true");
        },
    });
}
