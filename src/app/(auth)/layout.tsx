import { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-ws-bg">
            {/* Minimal nav */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-ws-border-subtle">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-[#0a0a0a]">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 0.5L13 3.75V10.25L7 13.5L1 10.25V3.75L7 0.5Z" fill="white" fillOpacity="0.9"/>
                            <path d="M7 4L10 5.75V9.25L7 11L4 9.25V5.75L7 4Z" fill="white" fillOpacity="0.35"/>
                        </svg>
                    </div>
                    <span className="text-[15px] font-semibold text-ws-text tracking-tight">WorkSphere</span>
                </Link>
            </header>

            {/* Auth content — centered */}
            <main className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-[400px] animate-fade-up">
                    {children}
                </div>
            </main>
        </div>
    );
}
