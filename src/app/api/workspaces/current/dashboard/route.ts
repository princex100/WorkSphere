import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { getPersonalWorkspaceDashboard } from "@/lib/services/dashboard.service";

export const GET = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    const dashboardData = await getPersonalWorkspaceDashboard(userId);

    return NextResponse.json(
        new ApiResponse(200, dashboardData, "Personal workspace dashboard retrieved successfully")
    );
});
