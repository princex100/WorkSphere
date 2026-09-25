import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { createTaskValidator, uuidValidator } from "@/lib/validators/task.validators";
import { createTask, getTasks } from "@/lib/services/task.service";

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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const isFavoriteParam = searchParams.get("is_favorite");
    const isFavorite = isFavoriteParam !== null ? isFavoriteParam === "true" : undefined;
    const search = searchParams.get("search") || undefined;

    const tasks = await getTasks(userId, {
        project_id: id,
        status,
        priority,
        is_favorite: isFavorite,
        search
    });

    return NextResponse.json(
        new ApiResponse(200, tasks, "Project tasks retrieved successfully")
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

    let body: any;
    try {
        body = await request.json();
    } catch {
        throw new ApiError("Invalid JSON payload", 400, [{ field: "body", message: "Request body must be valid JSON" }]);
    }

    body.project_id = id;

    const validationResult = createTaskValidator(body);
    if (!validationResult.success) {
        throw new ApiError("Validation error", 400, validationResult.errors);
    }

    const newTask = await createTask(userId, validationResult.data);

    return NextResponse.json(
        new ApiResponse(201, newTask, "Project task created successfully"),
        { status: 201 }
    );
});
