"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGoogleLogin } from "@react-oauth/google";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLogin } from "@/hooks/auth/useLogin";
import { useGoogleOauth } from "@/hooks/auth/useGoogleOauth";

// ── Validation ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
    credential: z.string().min(1, "Email or username is required"),
    password:   z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

// ── Helper to extract API error messages ──────────────────────────────────────

function getApiError(error: unknown): string {
    if (error && typeof error === "object" && "response" in error) {
        const res = (error as { response?: { data?: { errors?: { message: string }[] } } }).response;
        const msg = res?.data?.errors?.[0]?.message;
        if (msg) return msg;
    }
    return "Something went wrong. Please try again.";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const searchParams  = useSearchParams();
    const resetSuccess  = searchParams.get("reset") === "success";

    const login       = useLogin();
    const googleLogin = useGoogleOauth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const onSubmit = (data: LoginForm) => login.mutate(data);

    // Google OAuth — uses the @react-oauth/google hook which triggers the
    // popup. The credential is then sent to our backend (not used directly).
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            // tokenResponse.access_token is the Google access token
            // that the backend will use to fetch the user profile.
            googleLogin.mutate(tokenResponse.access_token);
        },
        onError: () => {
            // silently ignore — user closed popup
        },
    });

    const isLoading = login.isPending || googleLogin.isPending;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-ws-text tracking-tight mb-1.5">
                    Welcome back
                </h1>
                <p className="text-[14px] text-ws-text-3">
                    Sign in to your WorkSphere account
                </p>
            </div>

            {/* Password reset success notice */}
            {resetSuccess && (
                <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-[13px] text-green-700">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="8" cy="8" r="7"/>
                        <path d="M5.5 8l1.8 1.8L10.5 6"/>
                    </svg>
                    Password updated successfully. You can log in now.
                </div>
            )}

            {/* API error */}
            {(login.isError || googleLogin.isError) && (
                <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
                    {getApiError(login.error ?? googleLogin.error)}
                </div>
            )}

            {/* Google OAuth */}
            <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full mb-4"
                onClick={() => handleGoogleLogin()}
                disabled={isLoading}
                leftIcon={
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                }
            >
                Continue with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-ws-border" />
                <span className="text-[12px] text-ws-text-4">or</span>
                <div className="flex-1 h-px bg-ws-border" />
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <Input
                    {...register("credential")}
                    label="Email or username"
                    placeholder="you@example.com"
                    type="text"
                    autoComplete="username email"
                    error={errors.credential?.message}
                    disabled={isLoading}
                />

                <div className="flex flex-col gap-1.5">
                    <Input
                        {...register("password")}
                        label="Password"
                        placeholder="••••••••"
                        type="password"
                        autoComplete="current-password"
                        error={errors.password?.message}
                        disabled={isLoading}
                    />
                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-[12px] text-ws-text-3 hover:text-ws-text transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <Button type="submit" size="lg" className="w-full mt-1" isLoading={login.isPending} disabled={isLoading}>
                    Sign in
                </Button>
            </form>

            {/* Sign up link */}
            <p className="mt-6 text-center text-[13px] text-ws-text-3">
                Don't have an account?{" "}
                <Link href="/signUp" className="text-ws-text font-medium hover:underline underline-offset-2">
                    Sign up
                </Link>
            </p>
        </div>
    );
}
