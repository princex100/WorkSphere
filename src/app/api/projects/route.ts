import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { createProjectValidator } from "@/lib/validators/project.validators";
import { createProject, getProjects } from "@/lib/services/project.service";

export const POST = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");

    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Unauthorized request" }
        ]);
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        throw new ApiError("Invalid JSON payload", 400, [
            { field: "body", message: "Request body must be valid JSON" }
        ]);
    }

    const validationResult = createProjectValidator(body);
    if (!validationResult.success) {
        throw new ApiError("Validation error", 400, validationResult.errors);
    }

    const createdProject = await createProject(userId, validationResult.data);

    return NextResponse.json(
        new ApiResponse(201, createdProject, "Project created successfully"),
        { status: 201 }
    );
});

export const GET = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");

    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Unauthorized request" }
        ]);
    }

    const workspaceId = request.nextUrl.searchParams.get("workspaceId") || undefined;

    const projects = await getProjects(userId, workspaceId);

    return NextResponse.json(
        new ApiResponse(200, projects, "Projects retrieved successfully")
    );
});
