import { NextRequest } from "next/server";
import { ApiError } from "@/lib/errors/ApiError";
import { validateVaultSession } from "@/lib/vault-session";

const VAULT_SESSION_COOKIE = "vaultSession";

/**
 * Reads the vault session token from the `vaultSession` cookie and validates it
 * against Redis.
 *
 * Call this at the top of every protected vault route handler.
 * Throws ApiError(403, VAULT_LOCKED) if:
 *  - The cookie is missing
 *  - The session has expired (TTL elapsed)
 *  - The token doesn't match what's stored in Redis
 *
 * The user's primary JWT session is NOT affected — they remain logged in.
 */
export const requireVaultSession = async (
    request: NextRequest,
    userId: string
): Promise<void> => {
    const token = request.cookies.get(VAULT_SESSION_COOKIE)?.value;

    if (!token) {
        throw new ApiError("Vault is locked", 403, [
            { field: "vault", message: "VAULT_LOCKED" }
        ]);
    }

    const isValid = await validateVaultSession(userId, token);
    if (!isValid) {
        throw new ApiError("Vault session expired or invalid", 403, [
            { field: "vault", message: "VAULT_LOCKED" }
        ]);
    }
};
