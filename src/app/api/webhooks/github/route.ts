import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { handleGitHubWebhook } from "@/lib/services/github.service";
import crypto from "crypto";

/**
 * Verifies the GitHub webhook signature.
 * GitHub signs the raw body with HMAC-SHA256 using the webhook secret and
 * sends the result in the `x-hub-signature-256` header as `sha256=<hex>`.
 */
function verifyGitHubSignature(rawBody: Buffer, signatureHeader: string | null): boolean {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
        // If no secret is configured, reject all webhook requests for safety.
        return false;
    }

    if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
        return false;
    }

    const expectedSignature = signatureHeader.slice("sha256=".length);
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const computedSignature = hmac.digest("hex");

    // Use timing-safe comparison to prevent timing attacks.
    try {
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, "hex"),
            Buffer.from(computedSignature, "hex")
        );
    } catch {
        // Buffer lengths differ — signature is invalid.
        return false;
    }
}

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    // Read raw bytes first — required for HMAC verification.
    let rawBodyBuffer: Buffer;
    try {
        const arrayBuffer = await request.arrayBuffer();
        rawBodyBuffer = Buffer.from(arrayBuffer);
    } catch {
        return NextResponse.json(
            new ApiResponse(400, null, "Failed to read request body"),
            { status: 400 }
        );
    }

    const signatureHeader = request.headers.get("x-hub-signature-256");
    if (!verifyGitHubSignature(rawBodyBuffer, signatureHeader)) {
        return NextResponse.json(
            new ApiResponse(401, null, "Invalid webhook signature"),
            { status: 401 }
        );
    }

    const event = request.headers.get("x-github-event") || "unknown";

    let payload: unknown;
    try {
        payload = JSON.parse(rawBodyBuffer.toString("utf-8"));
    } catch {
        return NextResponse.json(
            new ApiResponse(400, null, "Invalid JSON payload"),
            { status: 400 }
        );
    }

    try {
        const result = await handleGitHubWebhook(event, payload);
        return NextResponse.json(
            new ApiResponse(200, result, "Webhook received and processed")
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            new ApiResponse(500, null, message),
            { status: 500 }
        );
    }
};
