import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-0 px-4">
            {/* Background gradient orbs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-500">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white" fillOpacity="0.9" />
                                <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="white" fillOpacity="0.4" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold text-text-primary tracking-tight">WorkSphere</span>
                    </div>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-8 shadow-lg border border-border">
                    {children}
                </div>
            </div>
        </div>
    );
}
