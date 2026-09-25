import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { linkRepoValidator } from "@/lib/validators/github.validators";
import { uuidValidator } from "@/lib/validators/project.validators";
import {
    linkRepositoryToProject,
    getProjectGitHubRepository,
    disconnectRepositoryFromProject
} from "@/lib/services/github.service";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export const GET = asynchandler(async (request: NextRequest, context?: unknown) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    const { id } = await (context as RouteContext).params;
    const uuidCheck = uuidValidator(id);
    if (!uuidCheck.success) {
        throw new ApiError("Invalid ID format", 400, uuidCheck.errors);
    }

    const repo = await getProjectGitHubRepository(userId, id);

    return NextResponse.json(
        new ApiResponse(200, repo, "Project GitHub repository retrieved successfully")
    );
});

export const POST = asynchandler(async (request: NextRequest, context?: unknown) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    const { id } = await (context as RouteContext).params;
    const uuidCheck = uuidValidator(id);
    if (!uuidCheck.success) {
        throw new ApiError("Invalid ID format", 400, uuidCheck.errors);
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        throw new ApiError("Invalid JSON payload", 400, [{ field: "body", message: "Request body must be valid JSON" }]);
    }

    const validationResult = linkRepoValidator(body);
    if (!validationResult.success) {
        throw new ApiError("Validation error", 400, validationResult.errors);
    }

    const linked = await linkRepositoryToProject(userId, id, validationResult.data);

    return NextResponse.json(
        new ApiResponse(200, linked, "GitHub repository connected to project successfully")
    );
});

export const DELETE = asynchandler(async (request: NextRequest, context?: unknown) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    const { id } = await (context as RouteContext).params;
    const uuidCheck = uuidValidator(id);
    if (!uuidCheck.success) {
        throw new ApiError("Invalid ID format", 400, uuidCheck.errors);
    }

    await disconnectRepositoryFromProject(userId, id);

    return NextResponse.json(
        new ApiResponse(200, { disconnected: true }, "GitHub repository disconnected from project successfully")
    );
});
