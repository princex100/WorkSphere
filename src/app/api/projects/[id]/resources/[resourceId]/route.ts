import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { updateResourceValidator } from "@/lib/validators/resource.validators";
import { uuidValidator } from "@/lib/validators/project.validators";
import { updateResource, deleteResource } from "@/lib/services/resource.service";

interface RouteContext {
    params: Promise<{ id: string; resourceId: string }>;
}

export const PATCH = asynchandler(async (request: NextRequest, context?: unknown) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    const { id, resourceId } = await (context as RouteContext).params;
    const projectUuidCheck = uuidValidator(id);
    const resourceUuidCheck = uuidValidator(resourceId);

    if (!projectUuidCheck.success || !resourceUuidCheck.success) {
        throw new ApiError("Invalid ID format", 400, [
            ...(!projectUuidCheck.success ? projectUuidCheck.errors : []),
            ...(!resourceUuidCheck.success ? resourceUuidCheck.errors : [])
        ]);
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        throw new ApiError("Invalid JSON payload", 400, [{ field: "body", message: "Request body must be valid JSON" }]);
    }

    const validationResult = updateResourceValidator(body);
    if (!validationResult.success) {
        throw new ApiError("Validation error", 400, validationResult.errors);
    }

    const updatedResource = await updateResource(userId, id, resourceId, validationResult.data);

    return NextResponse.json(
        new ApiResponse(200, updatedResource, "Project resource updated successfully")
    );
});

export const DELETE = asynchandler(async (request: NextRequest, context?: unknown) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    const { id, resourceId } = await (context as RouteContext).params;
    const projectUuidCheck = uuidValidator(id);
    const resourceUuidCheck = uuidValidator(resourceId);

    if (!projectUuidCheck.success || !resourceUuidCheck.success) {
        throw new ApiError("Invalid ID format", 400, [
            ...(!projectUuidCheck.success ? projectUuidCheck.errors : []),
            ...(!resourceUuidCheck.success ? resourceUuidCheck.errors : [])
        ]);
    }

    const result = await deleteResource(userId, id, resourceId);

    return NextResponse.json(
        new ApiResponse(200, result, "Project resource deleted successfully")
    );
});
