import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { createVaultLinkValidator } from "@/lib/validators/vault.validators";
import { createPersonalLink, getPersonalLinks } from "@/lib/services/vault.service";

export const GET = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const isFavoriteParam = searchParams.get("is_favorite");
    const isFavorite = isFavoriteParam !== null ? isFavoriteParam === "true" : undefined;

    const links = await getPersonalLinks(userId, { search, is_favorite: isFavorite });

    return NextResponse.json(
        new ApiResponse(200, links, "Personal links retrieved successfully")
    );
});

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

    const validationResult = createVaultLinkValidator(body);
    if (!validationResult.success) {
        throw new ApiError("Validation error", 400, validationResult.errors);
    }

    const link = await createPersonalLink(userId, validationResult.data);

    return NextResponse.json(
        new ApiResponse(201, link, "Personal link created successfully"),
        { status: 201 }
    );
});
