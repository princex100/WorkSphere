import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { getCurrentWorkspace } from "@/lib/services/workspace.service";

export const GET = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");

    if (!userId) {
        throw new ApiError("Unauthorized", 401, [
            { field: "user", message: "Unauthorized request" }
        ]);
    }

    const currentWorkspace = await getCurrentWorkspace(userId);

    return NextResponse.json(
        new ApiResponse(200, currentWorkspace, "Current workspace retrieved successfully")
    );
});
