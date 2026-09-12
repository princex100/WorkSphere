import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
import { ApiError } from "@/lib/errors/ApiError";
import { loginUser } from "@/lib/services/auth.service";

type loginRequestType={
   
    credential:string | undefined,
    password:string
}
export const POST=asynchandler(async(request:NextRequest)=>{
  
    if(!request){
      throw new ApiError("Invalid request",400,[{field:"request",message:"invalid request"}])
    }

    const data:loginRequestType=await request.json()

    if(!data){
        throw new ApiError("Invalid request",400,[{field:"data",message:"invalid data"}])
    }

    const User=await loginUser(data);

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

    const response = NextResponse.json(
        new ApiResponse(200, User, "User logged in successfully")
    );

    response.cookies.set("accessToken", User.accessToken, options1);
    response.cookies.set("refreshToken", User.refreshToken, options2);

    return response;


})