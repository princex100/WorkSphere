import { ApiError } from "@/lib/errors/ApiError";
import { NextRequest,NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { jwtVerify } from "jose";
import { findUserbyId } from "@/lib/repositories/user.repository";

export const jwtverify=async(request:NextRequest)=>{

   const access_token=request.cookies.get("accessToken")

   if(!access_token){
      throw new ApiError("Unauthorized",401,[{ field:"token", message:"token is required" }])
   }

    type JwtPayload={
    id:string,
    username:string,
    email:string,
    role:string
   }

   const secret=new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)
   const {payload}=await jwtVerify<JwtPayload>(access_token.value,secret) 

   if(!payload){
    throw new ApiError("Unauthorized",401,[{ field:"token", message:"token is expired or invalid" }])
   }

  

 const requestheaders=new Headers(request.headers);

  requestheaders.set("user",payload.id);
  requestheaders.set("role",payload.role)


  return {
    success:true,
    message:"token is valid",
    requestheaders
  };

}