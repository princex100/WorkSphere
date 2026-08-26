import { NextResponse,NextRequest } from "next/server"
import { asynchandler } from "@/lib/utils/asynchandler"
import { registerValidator } from "@/lib/validators/auth.validators";
import { ApiError } from "@/lib/errors/ApiError";
import { registerUser } from "@/lib/services/auth.service";

export const POST=asynchandler(async(request:NextRequest)=>{

    const req=await request.json();

    const user=await registerUser(req);

    if(user.success){
        return NextResponse.json(
            {
                success:true,
                message:user.message,
                user:user.user
                
            },{
                status:201
            }
        )
    }


})