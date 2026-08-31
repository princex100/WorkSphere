import { NextRequest, NextResponse } from "next/server"
import { ApiResponse } from "../responses/ApiResponse"
import { ApiError } from "../errors/ApiError"

type asyncFn=(
    request:NextRequest
)=>Promise<NextResponse | void>


export const asynchandler=(fn:asyncFn)=>async(request:NextRequest)=>{

    try {
       return await fn(request);

    } catch (error) {
        
       if(error instanceof ApiError){
        return NextResponse.json(
            {
                sucess:false,
                message:error.message,
                errors:error.errors
            },
            {status:error.statusCode}
        )
       }
       console.error("Unknown error occurred",error);
       return NextResponse.json(
        {
            sucess:false,
            message:"Internal Server Error",
            errors:error
        },
        {status:500}
       )
    }
}