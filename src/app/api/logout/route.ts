import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest,NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { logout } from "@/lib/services/auth.service";

export const POST=asynchandler(async (request:NextRequest)=>{

    if(!request){
        throw new ApiError("Invalid request",400,[
            {field:"request",message:"invalid request"}
        ])
    }

    const userId=request.headers.get("user")

    if(!userId){
        throw new ApiError("Unauthorized",401,[{field:"token",message:"Unauthorized"}])
    }

    const UserLoggedOut=await logout(userId);

    const response=NextResponse.json(
        new ApiResponse(200,{user:null},"User logged out successfully")
    )

    response.cookies.set("accessToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 0
    });
    response.cookies.set("refreshToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 0
    })

    return response

})