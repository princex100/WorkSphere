import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { uuidValidator } from "@/lib/validators/project.validators";
import { uploadProjectFile, getProjectFiles } from "@/lib/services/file.service";

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
    const search = searchParams.get("search") || undefined;
    const resourceType = searchParams.get("resource_type") || undefined;
    const isFavoriteParam = searchParams.get("is_favorite");
    const isFavorite = isFavoriteParam !== null ? isFavoriteParam === "true" : undefined;

    const files = await getProjectFiles(userId, id, {
        search,
        resource_type: resourceType,
        is_favorite: isFavorite
    });

    return NextResponse.json(
        new ApiResponse(200, files, "Project files retrieved successfully")
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

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        throw new ApiError("Invalid form data", 400, [{ field: "file", message: "Expected multipart/form-data" }]);
    }

    const file = formData.get("file") as File | null;
    if (!file) {
        throw new ApiError("File is required", 400, [{ field: "file", message: "No file was attached" }]);
    }

    const isFavorite = formData.get("is_favorite") === "true";

    const savedFile = await uploadProjectFile(userId, id, file, isFavorite);

    return NextResponse.json(
        new ApiResponse(201, savedFile, "File uploaded successfully"),
        { status: 201 }
    );
});
