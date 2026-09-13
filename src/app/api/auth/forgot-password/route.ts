import { asynchandler } from "@/lib/utils/asynchandler";
import { ApiError } from "@/lib/errors/ApiError";
import { NextRequest, NextResponse } from "next/server";
import { password_reset } from "@/lib/services/auth.service";
import { ApiResponse } from "@/lib/responses/ApiResponse";
// import { request } from "http";

export const POST=asynchandler(async(request:NextRequest)=>{

    if(!request){
        throw new ApiError("bad request",400,[{field:"request",message:"request not found"}])
    }
    
    const body=await request.json();

    if(!body){
        throw new ApiError("bad request",400,[{field:"body",message:"body not found"}])
    }

    const {email}=body;

    if(!email){
        throw new ApiError("bad request",400,[{field:"email",message:"email not found"}])
    }

    const result = await password_reset(email)

    return NextResponse.json(
        new ApiResponse(200,result.user,result.message)
    )

})