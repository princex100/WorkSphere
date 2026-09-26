"use client";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/lib/api/auth.api";

export function useForgotPassword() {
    return useMutation({
        mutationFn: (email: string) => forgotPassword(email),
    });
}
