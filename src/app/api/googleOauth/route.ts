import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/errors/ApiError";
import { googleOauth } from "@/lib/services/auth.service";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import axios from "axios";

export const POST=asynchandler(async(request:NextRequest)=>{
    

    const token= await request.json();
    

    if(!token.access_token){
        throw new ApiError("token is required",400,[
            {field:"token",message:"token is required"}
        ])
    }


    const userInfo=await googleOauth(token.access_token);
    
    const options1={
    httpOnly:true,
    secure:true,
    sameSite:"strict",
    maxAge:5*60

     }
      const options2={
    httpOnly:true,
    secure:true,
    sameSite:"strict",
    maxAge:10*24*60*60

     }

    if(userInfo.success){
                const response= NextResponse.json(
            new ApiResponse(200,userInfo,"user info is here")
        )

        response.cookies.set("accessToken",userInfo.accessToken,options1 as any)
        response.cookies.set("refreshToken",userInfo.refreshToken,options2 as any)
        
        return response;
    }
    else{
        throw new ApiError("google oauth failed",500,[{field:"user",message:"user not found"}])
    }
    
})
