import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { refreshAccessToken } from "@/lib/services/auth.service";

export const POST = asynchandler(async (request: NextRequest) => {
    if (!request) {
        throw new ApiError("Invalid request", 400, [
            { field: "request", message: "invalid request" }
        ]);
    }

    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
        throw new ApiError("Unauthorized", 401, [
            { field: "token", message: "token is required" }
        ]);
    }

    const result = await refreshAccessToken(refreshToken);

    const response = NextResponse.json(
        new ApiResponse(
            200,
            // Never expose tokens in the body — only set them as HttpOnly cookies.
            { success: true },
            "Access token refreshed successfully"
        )
    );

    // New access token — short-lived.
    response.cookies.set("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 5 * 60  // 5 minutes
    });

    // Rotated refresh token — replaces the old one (single-use rotation).
    response.cookies.set("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60  // 7 days
    });

    return response;
});
