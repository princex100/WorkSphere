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

    const isUserLoggedIn=await loginUser(data);
    


    


    return NextResponse.json(
        new ApiResponse(200,{},"User logged in successfully")
    )


})