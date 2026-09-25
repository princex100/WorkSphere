import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { createVaultNoteValidator } from "@/lib/validators/vault.validators";
import { createPersonalNote, getPersonalNotes } from "@/lib/services/vault.service";
import { requireVaultSession } from "@/lib/utils/requireVaultSession";

export const GET = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    await requireVaultSession(request, userId);

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const isFavoriteParam = searchParams.get("is_favorite");
    const isFavorite = isFavoriteParam !== null ? isFavoriteParam === "true" : undefined;

    const notes = await getPersonalNotes(userId, { search, is_favorite: isFavorite });

    return NextResponse.json(
        new ApiResponse(200, notes, "Personal notes retrieved successfully")
    );
});

export const POST = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    await requireVaultSession(request, userId);

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        throw new ApiError("Invalid JSON payload", 400, [{ field: "body", message: "Request body must be valid JSON" }]);
    }

    const validationResult = createVaultNoteValidator(body);
    if (!validationResult.success) {
        throw new ApiError("Validation error", 400, validationResult.errors);
    }

    const note = await createPersonalNote(userId, validationResult.data);

    return NextResponse.json(
        new ApiResponse(201, note, "Personal note created successfully"),
        { status: 201 }
    );
});
