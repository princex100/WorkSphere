import jwt from "jsonwebtoken"
import User from "@/types/user.type";
import { ApiError } from "../errors/ApiError";
import { findUserbyId } from "../repositories/user.repository";


const generateAccessToken=(userId:string,user:User)=>{
    
    const secret=process.env.ACCESS_TOKEN_SECRET;
    if(!secret){
        throw new ApiError("Access token secret not found",500)
    }
    
    const expiry=process.env.ACCESS_TOKEN_EXPIRY;
    if(!expiry){
        throw new ApiError("Access token expiry not found",500)
    }
    
   return jwt.sign(
        {
            id:userId,
            username:user.name,
            email:user.email,
            role:user.global_role
        },
        secret,
        {
            expiresIn:expiry as jwt.SignOptions["expiresIn"]
        }
    )
};


export const generateRefreshToken=(userId:string,user:User)=>{

    const secret=process.env.REFRESH_TOKEN_SECRET;
    if(!secret){
        throw new ApiError("Access token secret not found",500)
    }
    
    const expiry=process.env.REFRESH_TOKEN_EXPIRY;
    if(!expiry){
        throw new ApiError("Access token expiry not found",500)
    }

    return jwt.sign(
        {
            id:userId,
            username:user.name,
            email:user.email,
            role:user.global_role
        },
        secret,
        {
            expiresIn:expiry as jwt.SignOptions["expiresIn"]
        }
    )
};

export const generateJwtTokens=async(userId:string)=>{
   
        const user=await findUserbyId(userId);
        const accessToken=generateAccessToken(userId,user)
        const refreshToken=generateRefreshToken(userId,user)
        return {
            accessToken,
            refreshToken
        }      
  
}