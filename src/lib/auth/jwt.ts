// import jwt from "jsonwebtoken"
// import User from "@/types/user.type";
// import { ApiError } from "../errors/ApiError";


// const generateAccessToken=(userId:string,user:User)=>{
//     jwt.sign(
//         {
//             id:userId,
//             username:user.name,
//             email:user.email,
//             role:user.global_role
//         },
//         process.env.ACCESS_TOKEN_SECRET!,
//         {
//             expiresIn:process.env.ACCESS_TOKEN_EXPIRY
//         }
//     )
// };


// const generateRefreshToken=(userId:string,user:User)=>{
//      jwt.sign(
//         {
//             id:userId,
//             username:user.name,
//             email:user.email,
//             role:user.global_role
//         },
//         process.env.REFRESH_TOKEN_SECRET!,
//         {
//             expiresIn:process.env.REFRESH_TOKEN_EXPIRY
//         }
//     )
// };

// export const generateJwtTokens=async(userId:string)=>{
//     try {
//         const user=await finduserById(userId);
//         const accessToken=generateAccessToken(userId,user)
//         const refreshToken=generateRefreshToken(userId,user)
//         return {
//             accessToken,
//             refreshToken
//         }

        
//     } catch (error) {
        
//         throw new ApiError("Failed to generate tokens",500);
//     }
// }