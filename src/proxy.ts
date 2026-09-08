import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ApiError } from './lib/errors/ApiError'
import { jwtverify } from './middlewares/Jwt.middleware'
 
// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
    try {

        const allowedOrigins = ["http://localhost:3000"];

        const publicpages = [
            "/",
            "/login",
            "/signUp",
            "/signUp/google-oauth",
            "/verify-email"
        ];
        
        const apipublicpaths = [
            "/api/register",
            "/api/login",
            "/api/verify-email",
            "/api/google-oauth",
            "/api/auth/google",
            "/api/auth/github"
        ];

    if(request.method==="OPTIONS"){
       
        const response=new NextResponse(null,{
            status:204,
            headers:{
                "Access-Control-Allow-Methods":"GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Allow-Headers":"Content-Type,Authorization",
                "Access-Control-Max-Age":"86400"
            }
        })

        const origin = request.headers.get("origin");

        if(origin && allowedOrigins.includes(origin)){
            response.headers.set("Access-Control-Allow-Origin",origin);
        }

        return response;
    }

    const response=NextResponse.next()

    const requestheaders=new Headers(request.headers);

    requestheaders.set("Access-Control-Allow-Origin","*");
    requestheaders.set("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
    requestheaders.set("Access-Control-Allow-Headers","Content-Type,Authorization");
    requestheaders.set("Access-Control-Max-Age","86400");
    
     const origin = request.headers.get("origin");

        if(origin && allowedOrigins.includes(origin)){
            response.headers.set("Access-Control-Allow-Origin",origin);
        }


    //---------------------------------------------------------------------------///////////////////


   const token = request.cookies.get("accessToken")?.value || request.cookies.get("token")?.value;

   const pathname=request.nextUrl.pathname

   if(pathname.startsWith("/api")){

     if(apipublicpaths.includes(pathname)){
        return response
     }

     if(!token){
        throw new ApiError("Unauthorized",401,[{ field:"token", message:"token is required" }])
     }

     const isjwtvalid=await jwtverify(request);

     if(!isjwtvalid.success){
        throw new ApiError(isjwtvalid.message,401,[{ field:"token", message:isjwtvalid.message }])
     }

     //setting headers
     return NextResponse.next({
        request:{
            headers:isjwtvalid.requestheadersjwt
        }
     })


   }
   
   else if(!pathname.startsWith("/api")){

    if(publicpages.includes(pathname) && !token){
        return response
    }

    if(publicpages.includes(pathname) && token){

        return NextResponse.redirect(new URL("/dashboard",request.nextUrl))
        
    }

    if(!token){
        return NextResponse.redirect(new URL("/login",request.nextUrl))
    }

    return response

   }
    } catch (error) {

        if(error instanceof ApiError){
            return NextResponse.json({
                success:false,
                message:error.message,
                errors:error.errors
            },{status:error.statusCode})
        }

        return NextResponse.json({
            success:false,
            message:"Internal server error",
            errors:[
                { field:"error",message:"Internal server error" }
            ]
        },{status:500})
        
    }


}
 
export const config = {
  matcher: [
    "/",
    "/api/:path*",
    "/login",
    "/signUp",
    "/signUp/:path*",
    "/verify-email",
    "/auth/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/workspaces",
    "/workspaces/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/logout"
  ]
}