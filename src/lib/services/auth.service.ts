 import { registerValidator } from "../validators/auth.validators";
 import { ApiError } from "../../lib/errors/ApiError";
 import crypto from 'crypto'
 import { sendEmail } from "../utils/sendEmail";
 import { createUserInDB, saveHashedToken, findEmailToken, findUserbyId,updateUserInDB ,deletePreviousTokens} from "../repositories/user.repository";
import bcrypt from "bcrypt"
import { generateJwtTokens } from "../auth/jwt";
import { saveRefreshTokenInDB ,findUserByEmail} from "../repositories/user.repository";
 

 
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
            avatar_url:"",
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


import axios from "axios";

export const googleOauth=async(token:string)=>{

  
    const response=await axios.get(process.env.GOOGLE_USERINFO_URL as string,{
         headers:{
             Authorization:`Bearer ${token}`
         }
     })

 
     if(!response){
         throw new ApiError("token is invalid",400,[
             {field:"token",message:"token is invalid"}
         ])
     }
 
     const userInfo=response.data;
     console.log(userInfo);

     const isUserinDB=await findUserByEmail(userInfo.email);

    if(isUserinDB){
         const {refreshToken,accessToken} = await generateJwtTokens(isUserinDB.id);

    const tokensaved=await saveRefreshTokenInDB(
        refreshToken,
        isUserinDB.id
    )

    if(!tokensaved){
        throw new ApiError("token could not be saved",500,[{ field:"token", message:"token could not be saved" }])
    }


    return {
        success:true,
      message:"Google oauth successful",
      user:userInfo,
      accessToken,
      refreshToken
     }


    }

    const user={   
        
        name:userInfo.name,
        email:userInfo.email,
        password_hash:"",
        avatar_url:userInfo.picture,
        mobile:"",
        country_code:"",
        global_role:'USER',
        is_email_verified:true

    }

    const createdUser=await createUserInDB(user);

    if(!createdUser){
        throw new ApiError("user could not be created",500,[{ field:"user", message:"user could not be created" }])
    }

    const {refreshToken,accessToken} = await generateJwtTokens(createdUser.id);

    const tokensaved=await saveRefreshTokenInDB(
        refreshToken,
        createdUser.id
    )

    if(!tokensaved){
        throw new ApiError("token could not be saved",500,[{ field:"token", message:"token could not be saved" }])
    }


    return {
        success:true,
      message:"Google oauth successful",
      user:userInfo,
      accessToken,
      refreshToken
     }



}



