import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ApiError } from './lib/errors/ApiError'
import { jwtverify } from './middlewares/Jwt.proxy'
 
// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {

    
    const requestheaders=new Headers();
    const forwardHeaders=new Headers(request.headers);

   const allowedOrigins = ["http://localhost:3000"];
    requestheaders.set("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
    requestheaders.set("Access-Control-Allow-Headers","Content-Type,Authorization");
    requestheaders.set("Access-Control-Max-Age","86400");
    
    forwardHeaders.set("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
    forwardHeaders.set("Access-Control-Allow-Headers","Content-Type,Authorization");
    forwardHeaders.set("Access-Control-Max-Age","86400");
     const origin = request.headers.get("origin");

        if(origin && allowedOrigins.includes(origin)){
            requestheaders.set("Access-Control-Allow-Origin",origin);
            forwardHeaders.set("Access-Control-Allow-Origin",origin);
        }
    try {

       

        const publicpages = [
            "/",
            "/login",
            "/signUp",
            "/signUp/google-oauth",
            "/verify-email"
        ];
        
        const apipublicpaths = [
            "/api/users/current-user",
            "/api/auth/register",
            "/api/auth/login",
            "/api/register",
            "/api/login",
            "/api/verify-email",
            "/api/auth/verify-email",
            "/api/google-oauth",
            "/api/auth/google",
            "/api/auth/google-oauth",
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

    const response=NextResponse.next({
        request:{
            headers:forwardHeaders
        }
    })

    

    //---------------------------------------------------------------------------///////////////////


   const token = request.cookies.get("accessToken")?.value || request.cookies.get("token")?.value || request.headers.get("Authorization")?.split(" ")[1];

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
      const nextResponse=NextResponse.next({
        request:{
            headers:isjwtvalid.requestheadersjwt
        }
     })


     requestheaders.forEach((val,key)=>{
        nextResponse.headers.set(key,val)
     })
   
     return nextResponse;
     


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
                errors:error.errors,
    
            },{status:error.statusCode,
                headers:requestheaders
            })
        }

        return NextResponse.json({
            success:false,
            message:"Internal server error",
            errors:[
                { field:"error",message:"Internal server error" }
            ]
        },{status:500,
            headers:requestheaders
        })
        
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
    "/logout",
  ]
}