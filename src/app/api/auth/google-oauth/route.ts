import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/errors/ApiError";
import { googleOauth } from "@/lib/services/auth.service";
import { ApiResponse } from "@/lib/responses/ApiResponse";

export const POST=asynchandler(async(request:NextRequest)=>{
    

    const body= await request.json();

    if(!body){
        throw new ApiError("body is required",400,[{field:"body",message:"body is required"}])
    }


    const accessToken=body?.access_token || body.token

    if(!accessToken || typeof accessToken!=="string" || accessToken.trim()===null || accessToken.trim()=== ""){
        throw new ApiError("token is required",400,[
            {field:"token",message:"token is required"}
        ])
    }


    const userInfo=await googleOauth(accessToken);
    
    const options1={
        httpOnly:true,
        secure:true,
        sameSite:"strict" as const,
        maxAge:5*60
    }
    const options2={
        httpOnly:true,
        secure:true,
        sameSite:"strict" as const,
        maxAge:10*24*60*60
    }

    if(userInfo.success){
        const response= NextResponse.json(
            new ApiResponse(200,userInfo.user,"user info is here")
        )

        response.cookies.set("accessToken",userInfo.accessToken,options1 as any)
        response.cookies.set("refreshToken",userInfo.refreshToken,options2 as any)
        return response;
    }
    else{
        throw new ApiError("google oauth failed",500,[{field:"user",message:"user not found"}])
    }
    
})
