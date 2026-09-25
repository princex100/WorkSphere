import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { uploadUserAvatar } from "@/lib/services/file.service";

export const POST = asynchandler(async (request: NextRequest) => {
    const userId = request.headers.get("user");
    if (!userId) {
        throw new ApiError("Unauthorized", 401, [{ field: "user", message: "Unauthorized request" }]);
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        throw new ApiError("Invalid form data", 400, [{ field: "file", message: "Expected multipart/form-data" }]);
    }

    const file = formData.get("file") as File | null;
    if (!file) {
        throw new ApiError("File is required", 400, [{ field: "file", message: "No avatar image provided" }]);
    }

    const updatedUser = await uploadUserAvatar(userId, file);

    return NextResponse.json(
        new ApiResponse(200, updatedUser, "Avatar uploaded successfully")
    );
});
