import { redis } from "@/lib/redis";
import crypto from "crypto";

// Vault sessions live in Redis for 30 minutes (configurable via env).
const VAULT_SESSION_TTL_SECONDS = parseInt(process.env.VAULT_SESSION_TTL_SECONDS || "1800", 10);

const redisKey = (userId: string) => `vault:session:${userId}`;

/**
 * Creates a vault session for the user and stores it in Redis.
 * Returns the opaque session token that the client must send as a cookie.
 */
export const createVaultSession = async (userId: string): Promise<string> => {
    // Cryptographically random 32-byte token — opaque, not a JWT.
    const token = crypto.randomBytes(32).toString("hex");

    await redis.set(redisKey(userId), token, "EX", VAULT_SESSION_TTL_SECONDS);

    return token;
};

/**
 * Validates a vault session token for the given user.
 * Returns true if the session is active, false if it is missing or expired.
 */
export const validateVaultSession = async (
    userId: string,
    token: string
): Promise<boolean> => {
    const stored = await redis.get(redisKey(userId));
    if (!stored) return false;

    // Constant-time comparison to prevent timing attacks.
    try {
        return crypto.timingSafeEqual(
            Buffer.from(stored, "hex"),
            Buffer.from(token, "hex")
        );
    } catch {
        return false;
    }
};

/**
 * Deletes the vault session immediately (explicit lock).
 */
export const destroyVaultSession = async (userId: string): Promise<void> => {
    await redis.del(redisKey(userId));
};

/**
 * Returns the remaining TTL in seconds, or null if no session exists.
 */
export const getVaultSessionTTL = async (userId: string): Promise<number | null> => {
    const ttl = await redis.ttl(redisKey(userId));
    return ttl > 0 ? ttl : null;
};
