import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { uploadPersonalFile, getPersonalFiles } from "@/lib/services/vault.service";
import { requireVaultSession } from "@/lib/utils/requireVaultSession";

export const GET = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    // Requires both a valid JWT (set by proxy) AND an active vault session.
    await requireVaultSession(request, userId);

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const isFavoriteParam = searchParams.get("is_favorite");
    const isFavorite = isFavoriteParam !== null ? isFavoriteParam === "true" : undefined;

    const files = await getPersonalFiles(userId, { search, is_favorite: isFavorite });

    return NextResponse.json(
        new ApiResponse(200, files, "Personal files retrieved successfully")
    );
});

export const POST = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    await requireVaultSession(request, userId);

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

    const savedFile = await uploadPersonalFile(userId, file, isFavorite);

    return NextResponse.json(
        new ApiResponse(201, savedFile, "Personal file uploaded successfully"),
        { status: 201 }
    );
});
