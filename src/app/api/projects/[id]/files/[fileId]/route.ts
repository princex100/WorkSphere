import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { updateFileValidator } from "@/lib/validators/file.validators";
import { uuidValidator } from "@/lib/validators/project.validators";
import { updateProjectFile, deleteProjectFile } from "@/lib/services/file.service";

interface RouteContext {
    params: Promise<{ id: string; fileId: string }>;
}

export const PATCH = asynchandler(async (request: NextRequest, context?: unknown) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    const { id, fileId } = await (context as RouteContext).params;
    const projectUuidCheck = uuidValidator(id);
    const fileUuidCheck = uuidValidator(fileId);

    if (!projectUuidCheck.success || !fileUuidCheck.success) {
        throw new ApiError("Invalid ID format", 400, [
            ...(!projectUuidCheck.success ? projectUuidCheck.errors : []),
            ...(!fileUuidCheck.success ? fileUuidCheck.errors : [])
        ]);
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        throw new ApiError("Invalid JSON payload", 400, [{ field: "body", message: "Request body must be valid JSON" }]);
    }

    const validationResult = updateFileValidator(body);
    if (!validationResult.success) {
        throw new ApiError("Validation error", 400, validationResult.errors);
    }

    const updatedFile = await updateProjectFile(userId, id, fileId, validationResult.data);

    return NextResponse.json(
        new ApiResponse(200, updatedFile, "File updated successfully")
    );
});

export const DELETE = asynchandler(async (request: NextRequest, context?: unknown) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    const { id, fileId } = await (context as RouteContext).params;
    const projectUuidCheck = uuidValidator(id);
    const fileUuidCheck = uuidValidator(fileId);

    if (!projectUuidCheck.success || !fileUuidCheck.success) {
        throw new ApiError("Invalid ID format", 400, [
            ...(!projectUuidCheck.success ? projectUuidCheck.errors : []),
            ...(!fileUuidCheck.success ? fileUuidCheck.errors : [])
        ]);
    }

    const result = await deleteProjectFile(userId, id, fileId);

    return NextResponse.json(
        new ApiResponse(200, result, "File deleted successfully")
    );
});
