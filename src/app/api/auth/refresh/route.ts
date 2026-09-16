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

    const accessTokenCookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "strict" as const,
        maxAge: 5 * 60
    };

    const response = NextResponse.json(
        new ApiResponse(
            200,
            { accessToken: result.accessToken },
            "Access token refreshed successfully"
        )
    );

    response.cookies.set("accessToken", result.accessToken, accessTokenCookieOptions);

    return response;
});
