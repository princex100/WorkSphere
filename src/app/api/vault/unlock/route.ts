import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { unlockVaultValidator } from "@/lib/validators/vault.validators";
import { unlockVault } from "@/lib/services/vault.service";

// Vault session cookie TTL in seconds (matches Redis TTL).
const VAULT_SESSION_TTL_SECONDS = parseInt(process.env.VAULT_SESSION_TTL_SECONDS || "1800", 10);
const VAULT_SESSION_COOKIE = "vaultSession";

export const POST = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        throw new ApiError("Invalid JSON payload", 400, [{ field: "body", message: "Request body must be valid JSON" }]);
    }

    const validationResult = unlockVaultValidator(body);
    if (!validationResult.success) {
        throw new ApiError("Validation error", 400, validationResult.errors);
    }

    const result = await unlockVault(userId, validationResult.data.password);

    // Set the vault session token as an HttpOnly, Secure, SameSite=Strict cookie.
    // The token itself is never returned in the JSON body — only the cookie is set.
    const response = NextResponse.json(
        new ApiResponse(200, { success: result.success, message: result.message }, result.message)
    );

    response.cookies.set(VAULT_SESSION_COOKIE, result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: VAULT_SESSION_TTL_SECONDS,
        path: "/api/vault"  // Scope the cookie to vault routes only.
    });

    return response;
});
