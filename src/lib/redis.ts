import Redis from "ioredis";

const getRedisUrl = (): string => {
    return process.env.REDIS_URL || "redis://localhost:6379";
};

declare global {
    // eslint-disable-next-line no-var
    var redisClient: Redis | undefined;
}

export const redis =
    globalThis.redisClient ||
    new Redis(getRedisUrl(), {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
        retryStrategy: (times) => {
            if (times > 3) return null;
            return Math.min(times * 100, 1000);
        }
    });

globalThis.redisClient = redis;

redis.on("error", (err) => {
    console.error("Redis connection error:", err);
});
