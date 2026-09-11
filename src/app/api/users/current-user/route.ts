import { NextRequest,NextResponse } from "next/server";
import { ApiError } from "@/lib/errors/ApiError";
import { findUserbyId } from "@/lib/repositories/user.repository";

type Response_body= {
        success:false,
        message:"user not found",
        user:null
     }
     
export async function GET(request:NextRequest){

   const id=request.nextUrl.searchParams.get("userId")
   const internal_secret=request.headers.get(   "internal_secret")

   if(!id || !internal_secret){
    throw new ApiError("Unauthorized",401,[{ field:"token", message:"token is expired or invalid" }])
   }

   if(internal_secret!==process.env.INTERNAL_SECRET){
    throw new ApiError("Unauthorized",401,[{ field:"token", message:"token is expired or invalid" }])
   }

   const user=await findUserbyId(id);

   if(!user){
     return NextResponse.json({
        success:false,
        message:"user not found",
        user:null
        
     },{status:401})
   }

   return NextResponse.json({
    success:true,
    message:"user is valid",
    user
   },{status:200})

}