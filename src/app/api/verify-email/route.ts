import { ApiError } from "@/lib/errors/ApiError";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { verifyEmail } from "@/lib/services/auth.service";
import { NextRequest, NextResponse } from "next/server"


export const GET=async(request:NextRequest)=>{

    const token= request.nextUrl.searchParams.get("token");


    if(!token){
        throw new ApiError("Token is required",400,[{ field:"token", message:"token is required" }]);

    }

    const updatedUser=await verifyEmail(token);

    return NextResponse.json(
        new ApiResponse(200,updatedUser.user,updatedUser.message)
    )

 
}

    



