import { asynchandler } from "@/lib/utils/asynchandler";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses/ApiResponse";
export const POST=asynchandler(async(request:NextRequest)=>{
  
    

    return NextResponse.json(
        new ApiResponse(200,{},"User logged in successfully")
    )


})