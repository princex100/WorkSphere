import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { getUpcomingTasks } from "@/lib/services/task.service";

export const GET = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    const workspaceId = request.nextUrl.searchParams.get("workspaceId") || undefined;
    const tasks = await getUpcomingTasks(userId, workspaceId);

    return NextResponse.json(
        new ApiResponse(200, tasks, "Upcoming tasks retrieved successfully")
    );
});
