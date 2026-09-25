import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { connectGitHubValidator } from "@/lib/validators/github.validators";
import { connectGitHubAccount } from "@/lib/services/github.service";

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

    const validationResult = connectGitHubValidator(body);
    if (!validationResult.success) {
        throw new ApiError("Validation error", 400, validationResult.errors);
    }

    const integration = await connectGitHubAccount(userId, validationResult.data.code);

    return NextResponse.json(
        new ApiResponse(200, integration, "GitHub account connected successfully")
    );
});
