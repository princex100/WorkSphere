 import { registerValidator } from "../validators/auth.validators";
 import { ApiError } from "../../lib/errors/ApiError";
 import crypto from 'crypto'
 import { sendEmail } from "../utils/sendEmail";
 import { createUserInDB, saveHashedToken, findEmailToken, findUserbyId,updateUserInDB ,deletePreviousTokens} from "../repositories/user.repository";
import bcrypt from "bcrypt"
 

 
 type Data={
        name:string,
        email:string,
        password:string,
        mobile:string,
        country_code:string,
        
    }
  
export const registerUser=async(data:Data)=>{
  
     const result=registerValidator(data);

        if(!result.success){

            throw new ApiError("registration failed",400,result.errors);
        }


const hashed_password=await bcrypt.hash(result.data?.password,10);

       
    let response={
            name:result.data.name ,
            email:result.data.email ,
            password_hash:hashed_password,
            mobile:result.data.mobile ,
            country_code:result.data.country_code ,
            global_role:'USER',
            is_email_verified:false
        }

     
       const createdUser=await createUserInDB(response);

       if(!createdUser){
        throw new ApiError("User could not be created.",500,[{
            field:'user' ,
            message:'user could not be created'
        }]);
       }


       const unhashedToken=crypto.randomBytes(20).toString("hex");

        const hashedToken=crypto
                          .createHash("sha256")
                          .update(unhashedToken)
                          .digest("hex");

       await deletePreviousTokens(createdUser.id)
       const hashedTokenSaved=await saveHashedToken(hashedToken,createdUser.id);

      
       
       if(!hashedTokenSaved){
        throw new ApiError("Failed to save email token.",500,[{
            field:'user' ,
            message:'user could not be created'
        }]);
       }
       



      const isEmailSent=await sendEmail(unhashedToken,createdUser.email);


      if(!isEmailSent){
          throw new ApiError("verification email could not be sent.",500,[{field:'email',message:'verification email could not be sent'}]
          );
      }



      return {
        success:true,
        message:"User registered successfully.",
        user:createdUser
      }
                



}



export const verifyEmail=async(token:string)=>{

    if(!token){
        throw new ApiError("Token is required",400,[
            { field:"token", message:"token is required" }
        ]);
    }
     
    const tokenHash=crypto
                          .createHash("sha256")
                          .update(token)
                          .digest("hex");
                          
    const tokenEntry= await findEmailToken(tokenHash);

    if(!tokenEntry){
        throw new ApiError("email verification token expired",400,[{ field:"token", message:"token is expired or invalid" }])

    }
   
    const user=await findUserbyId(tokenEntry.user_id);

    if(!user){
        throw new ApiError("user not found",500,[{ field:"user", message:"user not found" }])
    }

    user.is_email_verified=true;
    

    const updatedUser=await updateUserInDB(user.id,user);
    

    if(!updatedUser){
        throw new ApiError("user not updated",500,[{ field:"user", message:"user not updated" }])
    }

    return {
        success:true,
        message:"User email verified successfully.",
        user:updatedUser
    }
    

}

