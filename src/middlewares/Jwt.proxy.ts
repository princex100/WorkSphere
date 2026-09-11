import { ApiError } from "@/lib/errors/ApiError";
import { NextRequest,NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { jwtVerify } from "jose";



export const jwtverify=async(request:NextRequest)=>{

     type Response_body={
        success:boolean,
        message:string,
        user:null
     }

   const access_token=request.cookies.get("accessToken")?.value || request.headers.get("Authorization")?.split(" ")[1];

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

   let payload:JwtPayload;

   try {
       const res=await jwtVerify<JwtPayload>(access_token,secret) 
       payload=res.payload
       
   } catch (error) {
    throw new ApiError("Unauthorized",401,[{ field:"token", message:"token is expired or invalid" }])
   }


   if(!payload){
    throw new ApiError("Unauthorized",401,[{ field:"token", message:"token is expired or invalid" }])
   }

   const isUser:Response_body=await fetch(`${process.env.BACKEND_API_BASE_URL}/users/current-user?userId=${payload.id}`,{
    method:"GET",
     headers:{
       "Authorization":`Bearer ${access_token}`,
       "internal_secret":process.env.INTERNAL_SECRET!
     }
   }).then((res)=>res.json());

  

   if(!isUser.success){
    throw new ApiError("Unauthorized",401,[{ field:"token", message:"token is expired or invalid" }])
   }


 const requestheadersjwt=new Headers(request.headers);

  requestheadersjwt.set("user",payload.id);
  requestheadersjwt.set("role",payload.role)


  return {
    success:true,
    message:"token is valid",
    requestheadersjwt
  };

}