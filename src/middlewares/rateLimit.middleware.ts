import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";
import { ApiError } from "@/lib/errors/ApiError";
import { RATE_LIMIT_CONFIG } from "@/constants";

const getClientIp = (request: NextRequest): string => {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        const clientIp = forwardedFor.split(",")[0].trim();
        if (clientIp) {
            return normalizeIp(clientIp);
        }
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
        return normalizeIp(realIp.trim());
    }

    return "unknown";
};

const normalizeIp = (ip: string): string => {
    if (ip === "::1" || ip === "::ffff:127.0.0.1" || ip === "localhost") {
        return "127.0.0.1";
    }
    return ip;
};

export const rateLimitMiddleware = async (request: NextRequest) => {
    const pathname = request.nextUrl.pathname;
    const config = RATE_LIMIT_CONFIG[pathname];

    // If the route is not configured for rate limiting, pass through
    if (!config) {
        return { success: true };
    }

    const clientIp = getClientIp(request);
    const key = `rate-limit:${config.routeName}:${clientIp}`;

    try {
        // Increment counter atomically
        const count = await redis.incr(key);

        // Set TTL only when counter is first created to prevent sliding window extension
        if (count === 1) {
            await redis.expire(key, config.windowSeconds);
        }

        if (count > config.limit) {
            throw new ApiError("Too many requests", 429, [
                {
                    field: "rate_limit",
                    message: "Too many requests. Please try again later."
                }
            ]);
        }

        return { success: true };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Fail-open policy: If Redis is down, log error and allow request through
        console.error("Redis Rate Limiter Error (Fail-Open policy engaged):", error);
        return { success: true };
    }
};
