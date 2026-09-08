import { ApiError } from "@/lib/errors/ApiError";
import { NextRequest, NextResponse } from "next/server"

export const corsMiddleware = (request: NextRequest) => {

    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173"
    ]

    const origin = request.headers.get("origin");
    if (origin && !allowedOrigins.includes(origin)) {
        throw new ApiError("Unauthorized", 403, [{ field: "origin", message: "origin not allowed" }])
    }


    const response = new NextResponse(null, { status: 204 });

        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        response.headers.set('Access-Control-Max-Age', '86400');

        if (origin && allowedOrigins.includes(origin)) {

            response.headers.set('Access-Control-Allow-Origin', origin);
        }

    if (request.method === "OPTIONS") {

        return {
            success:true,
            response
        };

    }
    else if (request.method !== "OPTIONS") {

        return {success:false,response};
    }

}