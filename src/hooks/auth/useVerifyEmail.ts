"use client";

import { useMutation } from "@tanstack/react-query";
import { verifyEmail } from "@/lib/api/auth.api";

export function useVerifyEmail() {
    return useMutation({
        mutationFn: (token: string) => verifyEmail(token),
    });
}
