import { ApiError } from "@/lib/errors/ApiError";
import { NextRequest, NextResponse } from "next/server"

export const corsMiddleware=(request:NextRequest)=>{

   if(request.method==="OPTIONS"){
    const response=new NextResponse(null,{status:204});

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400'); 
 
    const origin=request.headers.get("origin");


    const allowedOrigins=[
        "http://localhost:3000",
        "http://localhost:5173"
    ]

    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    

    if(origin && !allowedOrigins.includes(origin)){
        throw new ApiError("Unauthorized",403,[{ field:"origin", message:"origin not allowed" }])
    }


    if(origin && allowedOrigins.includes(origin)){
        response.headers.set('Access-Control-Allow-Origin', origin);
    }


    return response;

    
   }
   
   else if(request.method!=="OPTIONS"){
    return null;
   }

}