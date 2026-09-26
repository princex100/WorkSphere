"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGoogleLogin } from "@react-oauth/google";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRegister } from "@/hooks/auth/useRegister";
import { useGoogleOauth } from "@/hooks/auth/useGoogleOauth";

// ── Validation ────────────────────────────────────────────────────────────────

const registerSchema = z
    .object({
        name:            z.string().min(2, "Name must be at least 2 characters"),
        email:           z.string().email("Enter a valid email address"),
        password:        z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type RegisterForm = z.infer<typeof registerSchema>;

function getApiError(error: unknown): string {
    if (error && typeof error === "object" && "response" in error) {
        const res = (error as { response?: { data?: { errors?: { message: string }[] } } }).response;
        const msg = res?.data?.errors?.[0]?.message;
        if (msg) return msg;
    }
    return "Something went wrong. Please try again.";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SignUpPage() {
    const registerMutation = useRegister();
    const googleOauth      = useGoogleOauth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

    const onSubmit = ({ name, email, password }: RegisterForm) =>
        registerMutation.mutate({ name, email, password });

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => googleOauth.mutate(tokenResponse.access_token),
        onError: () => {},
    });

    const isLoading = registerMutation.isPending || googleOauth.isPending;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-ws-text tracking-tight mb-1.5">
                    Create your account
                </h1>
                <p className="text-[14px] text-ws-text-3">
                    Start managing your work with WorkSphere
                </p>
            </div>

            {/* API error */}
            {(registerMutation.isError || googleOauth.isError) && (
                <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
                    {getApiError(registerMutation.error ?? googleOauth.error)}
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

            {/* Register form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <Input
                    {...register("name")}
                    label="Full name"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    error={errors.name?.message}
                    disabled={isLoading}
                />
                <Input
                    {...register("email")}
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    disabled={isLoading}
                />
                <Input
                    {...register("password")}
                    label="Password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    error={errors.password?.message}
                    disabled={isLoading}
                />
                <Input
                    {...register("confirmPassword")}
                    label="Confirm password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    disabled={isLoading}
                />

                <Button type="submit" size="lg" className="w-full mt-1" isLoading={registerMutation.isPending} disabled={isLoading}>
                    Create account
                </Button>
            </form>

            <p className="mt-4 text-center text-[11px] text-ws-text-4 leading-5">
                By creating an account, you agree to our{" "}
                <span className="text-ws-text-3">Terms of Service</span> and{" "}
                <span className="text-ws-text-3">Privacy Policy</span>.
            </p>

            {/* Login link */}
            <p className="mt-5 text-center text-[13px] text-ws-text-3">
                Already have an account?{" "}
                <Link href="/login" className="text-ws-text font-medium hover:underline underline-offset-2">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
