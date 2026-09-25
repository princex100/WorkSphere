import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { createTaskValidator } from "@/lib/validators/task.validators";
import { createTask, getTasks } from "@/lib/services/task.service";

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

    const validationResult = createTaskValidator(body);
    if (!validationResult.success) {
        throw new ApiError("Validation error", 400, validationResult.errors);
    }

    const newTask = await createTask(userId, validationResult.data);

    return NextResponse.json(
        new ApiResponse(201, newTask, "Task created successfully"),
        { status: 201 }
    );
});

export const GET = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const isFavoriteParam = searchParams.get("is_favorite");
    const isFavorite = isFavoriteParam !== null ? isFavoriteParam === "true" : undefined;
    const search = searchParams.get("search") || undefined;
    const onlyPersonalParam = searchParams.get("only_personal");
    const onlyPersonal = onlyPersonalParam === "true";

    const tasks = await getTasks(userId, {
        workspaceId,
        project_id: projectId,
        status,
        priority,
        is_favorite: isFavorite,
        search,
        only_personal: onlyPersonal
    });

    return NextResponse.json(
        new ApiResponse(200, tasks, "Tasks retrieved successfully")
    );
});
