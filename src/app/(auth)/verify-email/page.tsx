"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "@/lib/api/auth.api";
import { Spinner } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

type State = "idle" | "verifying" | "success" | "error" | "sent";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const token  = searchParams.get("token");
    const sent   = searchParams.get("sent") === "true";

    const [state, setState] = useState<State>(sent ? "sent" : token ? "verifying" : "idle");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!token) return;

        const verify = async () => {
            setState("verifying");
            try {
                await verifyEmail(token);
                setState("success");
            } catch (err: unknown) {
                const apiErr = err as { response?: { data?: { errors?: { message: string }[] } } };
                setErrorMsg(apiErr?.response?.data?.errors?.[0]?.message ?? "Verification failed.");
                setState("error");
            }
        };

        verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // ── States ──────────────────────────────────────────────────────────────

    // Email sent — user just registered
    if (state === "sent") {
        return (
            <div className="text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-ws-bg-alt border border-ws-border">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold text-ws-text tracking-tight mb-2">Check your inbox</h1>
                <p className="text-[14px] text-ws-text-3 max-w-xs mx-auto mb-6">
                    We've sent a verification link to your email. Click it to verify your account.
                </p>
                <p className="text-[12px] text-ws-text-4">
                    Didn't receive it? Check your spam folder.
                </p>
                <div className="mt-6">
                    <Link href="/login">
                        <Button variant="secondary" size="sm">Back to sign in</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Verifying...
    if (state === "verifying") {
        return (
            <div className="text-center">
                <Spinner size="lg" className="mx-auto mb-5" />
                <h1 className="text-xl font-semibold text-ws-text tracking-tight mb-1.5">Verifying your email</h1>
                <p className="text-[14px] text-ws-text-3">Just a moment…</p>
            </div>
        );
    }

    // Success
    if (state === "success") {
        return (
            <div className="text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-green-50 border border-green-100">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m9 12 2 2 4-4"/>
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold text-ws-text tracking-tight mb-2">Email verified</h1>
                <p className="text-[14px] text-ws-text-3 mb-6">
                    Your account is ready. You can now sign in.
                </p>
                <Link href="/login">
                    <Button size="md">Sign in to WorkSphere</Button>
                </Link>
            </div>
        );
    }

    // Error
    if (state === "error") {
        return (
            <div className="text-center">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-red-50 border border-red-100">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold text-ws-text tracking-tight mb-2">Verification failed</h1>
                <p className="text-[14px] text-ws-text-3 max-w-xs mx-auto mb-6">
                    {errorMsg || "This link may be expired or already used."}
                </p>
                <Link href="/login">
                    <Button variant="secondary" size="sm">Back to sign in</Button>
                </Link>
            </div>
        );
    }

    // Idle — no token, no sent flag
    return (
        <div className="text-center">
            <h1 className="text-2xl font-semibold text-ws-text tracking-tight mb-2">Verify your email</h1>
            <p className="text-[14px] text-ws-text-3 mb-6">
                Check your inbox for a verification link, or register a new account.
            </p>
            <Link href="/signUp">
                <Button variant="secondary" size="sm">Create account</Button>
            </Link>
        </div>
    );
}
