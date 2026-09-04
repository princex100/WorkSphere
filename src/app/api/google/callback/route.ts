import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {

    const code = request.nextUrl.searchParams.get("code");

    console.log("GOOGLE CODE:", code);

    return NextResponse.json({
        message: "Google callback reached",
        code,
    });
};
