"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useResetPassword } from "@/hooks/auth/useResetPassword";

const schema = z
    .object({
        password:        z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords don't match",
        path:    ["confirmPassword"],
    });

type Form = z.infer<typeof schema>;

function getApiError(error: unknown): string {
    if (error && typeof error === "object" && "response" in error) {
        const res = (error as { response?: { data?: { errors?: { message: string }[] } } }).response;
        const msg = res?.data?.errors?.[0]?.message;
        if (msg) return msg;
    }
    return "This reset link may be expired or already used.";
}

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const mutation = useResetPassword();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Form>({ resolver: zodResolver(schema) });

    // ── No token ─────────────────────────────────────────────────────────────
    if (!token) {
        return (
            <div className="text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-red-50 border border-red-100">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h1 className="text-xl font-semibold text-ws-text tracking-tight mb-2">Invalid reset link</h1>
                <p className="text-[14px] text-ws-text-3 mb-5">
                    This link is missing a reset token. Please request a new one.
                </p>
                <Link href="/forgot-password">
                    <Button variant="secondary" size="sm">Request new link</Button>
                </Link>
            </div>
        );
    }

    const onSubmit = ({ password, confirmPassword }: Form) => mutation.mutate({ token, password, confirmPassword });

    // ── Form ─────────────────────────────────────────────────────────────────
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-ws-text tracking-tight mb-1.5">
                    Set new password
                </h1>
                <p className="text-[14px] text-ws-text-3">
                    Choose a strong password for your account.
                </p>
            </div>

            {mutation.isError && (
                <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
                    {getApiError(mutation.error)}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <Input
                    {...register("password")}
                    label="New password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    error={errors.password?.message}
                    disabled={mutation.isPending}
                />
                <Input
                    {...register("confirmPassword")}
                    label="Confirm new password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    disabled={mutation.isPending}
                />
                <Button type="submit" size="lg" className="w-full mt-1" isLoading={mutation.isPending}>
                    Reset password
                </Button>
            </form>

            <p className="mt-5 text-center text-[13px] text-ws-text-3">
                Remembered it?{" "}
                <Link href="/login" className="text-ws-text font-medium hover:underline underline-offset-2">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
