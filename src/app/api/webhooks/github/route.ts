import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { handleGitHubWebhook } from "@/lib/services/github.service";

export const POST = asynchandler(async (request: NextRequest) => {
    const event = request.headers.get("x-github-event") || "unknown";

    let payload: any;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json(
            new ApiResponse(400, null, "Invalid JSON payload"),
            { status: 400 }
        );
    }

    const result = await handleGitHubWebhook(event, payload);

    return NextResponse.json(
        new ApiResponse(200, result, "Webhook received and processed")
    );
});
