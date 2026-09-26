"use client";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/user.api";

/**
 * useCurrentUser
 * Central hook for auth state. Returns the current user if authenticated.
 * Used by layouts and guards to determine login state.
 *
 * - isLoading: true during the first fetch
 * - isAuthenticated: true when user data exists
 * - The 401 from the backend (expired / missing token) is handled silently
 *   by the Axios interceptor's refresh flow; if refresh fails, the query
 *   will fail and isAuthenticated will be false.
 */
export function useCurrentUser() {
    const { data: user, isLoading, isError, error } = useQuery({
        queryKey: ["current-user"],
        queryFn: getCurrentUser,
        // Don't retry on 401 — the Axios interceptor already handled refresh.
        retry: false,
        // Once the user is loaded, keep data for 5 minutes before going stale.
        staleTime: 5 * 60 * 1000,
    });

    return {
        user,
        isLoading,
        isError,
        error,
        isAuthenticated: !!user && !isError,
    };
}
