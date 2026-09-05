import { NextRequest, NextResponse } from "next/server";
import { jwtverify } from "./middlewares/Jwt.middleware";
import { corsMiddleware } from "./middlewares/cors.middleware";
import { ApiError } from "./lib/errors/ApiError";

export const middleware=async(request:NextRequest)=>{

    const pathname=request.nextUrl.pathname;

    const publicRoutes=[
        "/api/register",
        "/api/login",
        "/api/auth/google",
        "/api/auth/github"
    ]

    const isPublic=publicRoutes.includes(pathname);
    if(isPublic)return NextResponse.next()
        
    try {

          const  response=corsMiddleware(request);

            if(response){
                return response
            }

          const {requestheaders}= await jwtverify(request);

          
         return NextResponse.next({
            request:{
                headers:requestheaders
            }
          })


        
    } catch (error) {

        if(error instanceof ApiError){
            return NextResponse.json(
                {
                    success:false,
                    message:error.message,
                    errors:error.errors
                },
                {status:error.statusCode}
            )
        }

        return NextResponse.json(
            {
                success:false,
                message:"Internal server error",
                errors:[{field:"server",message:"server error"}]
            },
            {status:500}
        )
    }

   
  
}