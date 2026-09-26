import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "WorkSphere — Your Personal Workspace",
    description:
        "WorkSphere is a focused project management platform for individuals and teams. Manage projects, tasks, files, and your personal vault — all in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full`}>
            <body className="min-h-full flex flex-col bg-ws-bg text-ws-text font-sans antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
