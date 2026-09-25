import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { getConnectedGitHubAccount, disconnectGitHubAccount } from "@/lib/services/github.service";

export const GET = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    const integration = await getConnectedGitHubAccount(userId);

    return NextResponse.json(
        new ApiResponse(200, integration, "GitHub integration status retrieved successfully")
    );
});

export const DELETE = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    await disconnectGitHubAccount(userId);

    return NextResponse.json(
        new ApiResponse(200, { disconnected: true }, "GitHub account disconnected successfully")
    );
});
