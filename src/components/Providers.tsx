"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    // Create a stable QueryClient per session.
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Don't refetch on window focus in dev — avoids noise
                        refetchOnWindowFocus: false,
                        // Retry once on failure
                        retry: 1,
                        // Data stays fresh for 30 seconds
                        staleTime: 30 * 1000,
                    },
                },
            })
    );

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </GoogleOAuthProvider>
    );
}