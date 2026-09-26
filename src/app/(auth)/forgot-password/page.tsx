"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";

const schema = z.object({
    email: z.string().email("Enter a valid email address"),
});
type Form = z.infer<typeof schema>;

function getApiError(error: unknown): string {
    if (error && typeof error === "object" && "response" in error) {
        const res = (error as { response?: { data?: { errors?: { message: string }[] } } }).response;
        const msg = res?.data?.errors?.[0]?.message;
        if (msg) return msg;
    }
    return "Something went wrong. Please try again.";
}

export default function ForgotPasswordPage() {
    const mutation = useForgotPassword();

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<Form>({ resolver: zodResolver(schema) });

    const onSubmit = ({ email }: Form) => mutation.mutate(email);

    // ── Success state ────────────────────────────────────────────────────────
    if (mutation.isSuccess) {
        return (
            <div className="text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-ws-bg-alt border border-ws-border">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold text-ws-text tracking-tight mb-2">Check your inbox</h1>
                <p className="text-[14px] text-ws-text-3 max-w-xs mx-auto mb-2">
                    If <span className="text-ws-text-2 font-medium">{getValues("email")}</span> is registered,
                    we've sent a password reset link.
                </p>
                <p className="text-[12px] text-ws-text-4 mb-6">
                    The link expires in 15 minutes. Check your spam folder too.
                </p>
                <Link href="/login">
                    <Button variant="secondary" size="sm">Back to sign in</Button>
                </Link>
            </div>
        );
    }

    // ── Form ─────────────────────────────────────────────────────────────────
    return (
        <div>
            <div className="mb-8">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] text-ws-text-3 hover:text-ws-text mb-5 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8.75 2.625L4.375 7l4.375 4.375"/>
                    </svg>
                    Back to sign in
                </Link>
                <h1 className="text-2xl font-semibold text-ws-text tracking-tight mb-1.5">Forgot password?</h1>
                <p className="text-[14px] text-ws-text-3">
                    Enter your email and we'll send you a reset link.
                </p>
            </div>

            {mutation.isError && (
                <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
                    {getApiError(mutation.error)}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <Input
                    {...register("email")}
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    disabled={mutation.isPending}
                />
                <Button type="submit" size="lg" className="w-full" isLoading={mutation.isPending}>
                    Send reset link
                </Button>
            </form>
        </div>
    );
}
