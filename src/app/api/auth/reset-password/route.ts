import { asynchandler } from "@/lib/utils/asynchandler";
import { ApiError } from "@/lib/errors/ApiError";
import { NextRequest,NextResponse } from "next/server";
import { resetPassword } from "@/lib/services/auth.service";
import { ApiResponse } from "@/lib/responses/ApiResponse";


type body={
    password:string;
    confirmPassword:string;
}


export const POST=asynchandler(async(request:NextRequest)=>{

    if(!request){
        throw new ApiError("Invalid request",400,[{field:"request",message:"invalid request"}])
    }

    const token=request.nextUrl.searchParams.get("token");
    const data:body=await request.json();

    if(!token){
        throw new ApiError("Invalid request",400,[{field:"token",message:"invalid token"}])
    }

    if(!data){
        throw new ApiError("Invalid request",400,[{field:"data",message:"invalid data"}])
    }

    if(data.password.length===0 || data.password.trim()===null || data.confirmPassword.length===0 || data.confirmPassword.trim()===null ){
        throw new ApiError("Invalid request",400,[{field:"password",message:"invalid password"}])
    }

    if(data.password!==data.confirmPassword){
        throw new ApiError("Invalid request",400,[{field:"password",message:"passwords do not match"}])
    }


    const result = await resetPassword(token,data.password)
    
    return NextResponse.json(new ApiResponse(200,result.user,"password reset successfull."))

    
    
})