import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { lockVault } from "@/lib/services/vault.service";

const VAULT_SESSION_COOKIE = "vaultSession";

/**
 * POST /api/vault/lock
 *
 * Immediately destroys the vault session in Redis and clears the vaultSession
 * cookie. The user stays logged in — only the vault is locked.
 */
export const POST = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    await lockVault(userId);

    const response = NextResponse.json(
        new ApiResponse(200, { locked: true }, "Vault locked successfully")
    );

    // Clear the vault session cookie.
    response.cookies.set(VAULT_SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/api/vault"
    });

    return response;
});
