"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api/auth.api";

export function useResetPassword() {
    const router = useRouter();

    return useMutation({
        mutationFn: ({ token, password, confirmPassword }: { token: string; password: string; confirmPassword?: string }) =>
            resetPassword(token, password, confirmPassword),
        onSuccess: () => {
            router.push("/login?reset=success");
        },
    });
}

