import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Extend AxiosRequestConfig to include _retry flag
declare module "axios" {
    export interface AxiosRequestConfig {
        _retry?: boolean;
    }
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "/api";

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true  // sends HttpOnly cookies (accessToken, refreshToken) automatically
});

// Mutex: prevents multiple concurrent refresh calls
let isRefreshing = false;

// Queue of { resolve, reject } callbacks for requests that arrived while a refresh was in flight
let failedQueue: Array<{
    resolve: () => void;
    reject: (error: unknown) => void;
}> = [];

/**
 * Drains the queue after a refresh attempt.
 * - error = null  → refresh succeeded, retry all queued requests
 * - error ≠ null  → refresh failed, reject all queued requests
 */
const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// ─── Request interceptor ─────────────────────────────────────────────────────
// Nothing to do: withCredentials=true makes the browser attach the accessToken
// cookie automatically on every request.
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => config,
    (error) => Promise.reject(error)
);

// ─── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError<{ errors?: Array<{ field: string; message: string }> }>) => {
        const originalRequest = error.config;

        // Only intercept 401 TOKEN_EXPIRED, and only once per request.
        const isTokenExpired =
            error.response?.status === 401 &&
            error.response?.data?.errors?.some((e) => e.message === "TOKEN_EXPIRED");

        if (!isTokenExpired || !originalRequest || originalRequest._retry) {
            return Promise.reject(error);
        }

        // ── Concurrent refresh guard ─────────────────────────────────────────
        // If another request already triggered a refresh, queue this one to
        // retry automatically once the refresh resolves.
        if (isRefreshing) {
            return new Promise<void>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => {
                    // Mark as retried so a second 401 on this request
                    // does not trigger another refresh cycle.
                    originalRequest._retry = true;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        // ── This request is the first to hit TOKEN_EXPIRED ───────────────────
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Use raw axios (not `api`) to avoid triggering this interceptor again.
            // Build the URL from the same env var to stay consistent — no hardcoded path.
            await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });

            // Refresh succeeded — drain the queue (all retry, no header injection needed
            // because the browser has already updated the accessToken cookie).
            processQueue(null);

            // Retry the original request. The browser will attach the new accessToken cookie.
            return api(originalRequest);

        } catch (refreshError) {
            // Refresh failed (refresh token expired / revoked / invalid).
            // Reject all queued requests and force the user to log in again.
            processQueue(refreshError);

            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);

export default api;