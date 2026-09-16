import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Extend AxiosRequestConfig to include _retry flag
declare module "axios" {
    export interface AxiosRequestConfig {
        _retry?: boolean;
    }
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "/api",
    withCredentials: true
});

// Mutex flag and queue for handling concurrent refresh requests
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // withCredentials is true by default on the instance,
        // so cookies (accessToken / refreshToken) are sent automatically by the browser.
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ errors?: Array<{ field: string; message: string }> }>) => {
        const originalRequest = error.config;

        const isTokenExpired =
            error.response?.status === 401 &&
            error.response?.data?.errors?.some((err) => err.message === "TOKEN_EXPIRED");

        if (isTokenExpired && originalRequest && !originalRequest._retry) {
            // If already refreshing, enqueue this request to wait for the ongoing refresh operation
            if (isRefreshing) {
                return new Promise<string | null>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (token && originalRequest.headers) {
                            originalRequest.headers["Authorization"] = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            // Mark request as retried to prevent infinite loops
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call refresh endpoint with raw axios instance to prevent recursive interceptor triggers
                const refreshResponse = await axios.post(
                    "/api/auth/refresh",
                    {},
                    { withCredentials: true }
                );

                const newAccessToken: string | null =
                    refreshResponse.data?.data?.accessToken || null;

                // Process and resolve all pending queued requests with new token
                processQueue(null, newAccessToken);

                if (newAccessToken && originalRequest.headers) {
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                }

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed: reject all queued requests
                processQueue(refreshError, null);

                // Handle unauthenticated user state
                if (typeof window !== "undefined") {
                    // Let the application know or handle unauthenticated state if needed
                    console.warn("Session expired. Please log in again.");
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;