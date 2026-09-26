import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Extend AxiosRequestConfig to include _retry flag
declare module "axios" {
    export interface AxiosRequestConfig {
        _retry?: boolean;
    }
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "/api",
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
                .then(() => api(originalRequest))        // cookies updated — just retry
                .catch((err) => Promise.reject(err));
        }

        // ── This request is the first to hit TOKEN_EXPIRED ───────────────────
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Use raw axios (not `api`) to avoid triggering this interceptor again.
            // withCredentials sends the refreshToken cookie; the response Set-Cookie
            // header automatically updates the accessToken & refreshToken cookies.
            await axios.post("/api/auth/refresh", {}, { withCredentials: true });

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