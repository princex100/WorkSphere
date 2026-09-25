import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { updateVaultLinkValidator } from "@/lib/validators/vault.validators";
import { uuidValidator } from "@/lib/validators/project.validators";
import { updatePersonalLink, deletePersonalLink } from "@/lib/services/vault.service";
import { requireVaultSession } from "@/lib/utils/requireVaultSession";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export const PATCH = asynchandler(async (request: NextRequest, context?: unknown) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    await requireVaultSession(request, userId);

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

    const validationResult = updateVaultLinkValidator(body);
    if (!validationResult.success) {
        throw new ApiError("Validation error", 400, validationResult.errors);
    }

    const updated = await updatePersonalLink(userId, id, validationResult.data);

    return NextResponse.json(
        new ApiResponse(200, updated, "Personal link updated successfully")
    );
});

export const DELETE = asynchandler(async (request: NextRequest, context?: unknown) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    await requireVaultSession(request, userId);

    const { id } = await (context as RouteContext).params;
    const uuidCheck = uuidValidator(id);
    if (!uuidCheck.success) {
        throw new ApiError("Invalid ID format", 400, uuidCheck.errors);
    }

    const result = await deletePersonalLink(userId, id);

    return NextResponse.json(
        new ApiResponse(200, result, "Personal link deleted successfully")
    );
});
