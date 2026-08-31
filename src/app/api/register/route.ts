import { NextResponse,NextRequest } from "next/server"
import { asynchandler } from "@/lib/utils/asynchandler"
import { registerValidator } from "@/lib/validators/auth.validators";
import { ApiError } from "@/lib/errors/ApiError";
import { registerUser } from "@/lib/services/auth.service";
import { ApiResponse } from "@/lib/responses/ApiResponse";

export const POST=asynchandler(async(request:NextRequest)=>{

    const req=await request.json();

    if(!req){
        throw new ApiError("Bad Request",400,[
            {field:"body",message:"request body is required"}
        ]);
    }

    const user=await registerUser(req);

    if(user.success){
        return NextResponse.json(
           new ApiResponse(201,user.message,user.user)
        )
    }
   



})
