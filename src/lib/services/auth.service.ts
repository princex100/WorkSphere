import { registerValidator } from "../validators/auth.validators";
import { ApiError } from "@/lib/errors/ApiError";
import crypto, { hash } from 'crypto'
import { sendEmail } from "../utils/sendEmail";
import {
    createUserInDB,
    createUserWithPersonalWorkspaceInDB,
    saveHashedToken,
    findEmailToken,
    findUserbyId,
    updateUserInDB,
    deletePreviousTokens,
    findUserByUsername,
    findUserByUsernameOrEmail,
    deletJWTfromDB,
    saveRefreshTokenInDB,
    findUserByEmail,
    findPasswordResetToken,
    deletePasswordResetTokens,
    findRefreshTokenInDB,
} from "../repositories/user.repository";
import bcrypt from "bcrypt"
import { generateJwtTokens, generateAccessToken } from "../auth/jwt";
import { jwtVerify } from "jose";
import { JWTExpired, JWTInvalid } from "jose/errors";

import { loginValidator } from "../validators/auth.validators";
import { savepasswordResetToken } from "../repositories/user.repository";



type Data = {
    name: string,
    username?: string,
    email: string,
    password: string,
    mobile: string,
    country_code: string,
}

export const registerUser = async (data: Data) => {

    const result = registerValidator(data);

    if (!result.success) {

        throw new ApiError("registration failed", 400, result.errors);
    }

    const existingEmail = await findUserByEmail(result.data.email);
    if (existingEmail) {
        throw new ApiError("Email already exists", 400, [{ field: "email", message: "Email is already registered" }]);
    }

    if (result.data.username) {
        const existingUsername = await findUserByUsername(result.data.username);
        if (existingUsername) {
            throw new ApiError("Username already taken", 400, [{ field: "username", message: "Username is already taken" }]);
        }
    }


    const hashed_password = await bcrypt.hash(result.data?.password, 10);


    let response = {
        name: result.data.name,
        username: result.data.username,
        email: result.data.email,
        password_hash: hashed_password,
        avatar_url: "",
        mobile: result.data.mobile,
        country_code: result.data.country_code,
        global_role: 'USER',
        is_email_verified: false
    }


    const userCreationResult = await createUserWithPersonalWorkspaceInDB(response);
    const createdUser = userCreationResult?.user;

    if (!createdUser) {
        throw new ApiError("User could not be created.", 500, [{
            field: 'user',
            message: 'user could not be created'
        }]);
    }


    const unhashedToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(unhashedToken)
        .digest("hex");

    await deletePreviousTokens(createdUser.id)
    const hashedTokenSaved = await saveHashedToken(hashedToken, createdUser.id);



    if (!hashedTokenSaved) {
        throw new ApiError("Failed to save email token.", 500, [{
            field: 'user',
            message: 'user could not be created'
        }]);
    }



    const url = `http://localhost:3000/auth/verify-email?token=${unhashedToken}`;

    const isEmailSent = await sendEmail(url, createdUser.email, sendEmailENUM.REGISTER);


    if (!isEmailSent.success) {
        throw new ApiError("verification email could not be sent.", 500, [{ field: 'email', message: 'verification email could not be sent' }]
        );
    }



    return {
        success: true,
        message: "User registered successfully.",
        user: createdUser
    }




}



export const verifyEmail = async (token: string) => {

    if (!token) {
        throw new ApiError("Token is required", 400, [
            { field: "token", message: "token is required" }
        ]);
    }

    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const tokenEntry = await findEmailToken(tokenHash);

    if (!tokenEntry) {
        throw new ApiError("email verification token expired", 400, [{ field: "token", message: "token is expired or invalid" }])

    }

    const user = await findUserbyId(tokenEntry.user_id);

    if (!user) {
        throw new ApiError("user not found", 500, [{ field: "user", message: "user not found" }])
    }

    user.is_email_verified = true;


    const updatedUser = await updateUserInDB(user.id, user);


    if (!updatedUser) {
        throw new ApiError("user not updated", 500, [{ field: "user", message: "user not updated" }])
    }

    return {
        success: true,
        message: "User email verified successfully.",
        user: updatedUser
    }


}


import axios from "axios";

export const googleOauth = async (token: string) => {


    const response = await axios.get(process.env.GOOGLE_USERINFO_URL as string, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })


    if (!response) {
        throw new ApiError("token is invalid", 400, [
            { field: "token", message: "token is invalid" }
        ])
    }

    const userInfo = response.data;
    console.log(userInfo);

    const isUserinDB = await findUserByEmail(userInfo.email);

    if (isUserinDB) {
        const { refreshToken, accessToken } = await generateJwtTokens(isUserinDB.id);

        const tokensaved = await saveRefreshTokenInDB(
            refreshToken,
            isUserinDB.id
        )

        if (!tokensaved) {
            throw new ApiError("token could not be saved", 500, [{ field: "token", message: "token could not be saved" }])
        }


        return {
            success: true,
            message: "Google oauth successful",
            user: {
                  id: isUserinDB.id,
            name: isUserinDB.name,
            username: isUserinDB.username,
            email: isUserinDB.email,
            mobile: isUserinDB.mobile,
            country_code: isUserinDB.country_code,
            global_role: isUserinDB.global_role,
            is_email_verified: isUserinDB.is_email_verified,
            avatar_url: isUserinDB.avatar_url
            },
            accessToken,
            refreshToken
        }


    }

    const user = {

        name: userInfo.name,
        email: userInfo.email,
        password_hash: "",
        avatar_url: userInfo.picture || "",
        mobile: "",
        country_code: "",
        global_role: 'USER',
        is_email_verified: true

    }

    const userCreationResult = await createUserWithPersonalWorkspaceInDB(user);
    const createdUser = userCreationResult?.user;

    if (!createdUser) {
        throw new ApiError("user could not be created", 500, [{ field: "user", message: "user could not be created" }])
    }

    const { refreshToken, accessToken } = await generateJwtTokens(createdUser.id);

    const tokensaved = await saveRefreshTokenInDB(
        refreshToken,
        createdUser.id
    )

    if (!tokensaved) {
        throw new ApiError("token could not be saved", 500, [{ field: "token", message: "token could not be saved" }])
    }


    return {
        success: true,
        message: "Google oauth successful",
        user: {
            id: createdUser.id,
            name: createdUser.name,
            username: createdUser.username,
            email: createdUser.email,
            mobile: createdUser.mobile,
            country_code: createdUser.country_code,
            global_role: createdUser.global_role,
            is_email_verified: createdUser.is_email_verified,
            avatar_url: createdUser.avatar_url
        },
        accessToken,
        refreshToken
    }



}
type loginRequestType = {
    credential: string | undefined,
    password: string
}

export const loginUser = async (data: loginRequestType) => {

    const { credential, password } = data;


    if (!credential) {
        throw new ApiError("username or email is required", 400, [{ field: "credential", message: "username or email is required" }])
    }

    if (!password) {
        throw new ApiError("password is required", 400, [{ field: "password", message: "password is required" }])
    }

    const validatedData = loginValidator({ credential, password });

    if (!validatedData.success) {
        throw new ApiError("Invalid credentials", 400, validatedData.errors)
    }

    const user = await findUserByUsernameOrEmail(validatedData.data.credential);

    if (!user) {
        throw new ApiError("Invalid credentials", 401, [{ field: "credential", message: "Invalid username/email or password" }])
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        throw new ApiError("Invalid credentials", 401, [{ field: "password", message: "Invalid username/email or password" }])
    }

    const { accessToken, refreshToken } = await generateJwtTokens(user.id);

    await saveRefreshTokenInDB(refreshToken, user.id);

    return {
        success: true,
        message: "User logged in successfully",
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            country_code: user.country_code,
            global_role: user.global_role,
            is_email_verified: user.is_email_verified,
            avatar_url: user.avatar_url
        },
        accessToken,
        refreshToken
    }

}


export const logout = async (userId: string) => {

    const isJWTtokenDeleted = await deletJWTfromDB(userId);



    return {
        success: true,
        message: "User logged out successfully",

    }
}

import { sendEmailENUM } from "@/constants";
import { emailValidator } from "../validators/auth.validators";
export const password_reset = async (email: string) => {

    const validatedData = emailValidator(email)

    if (!validatedData.success) {
        throw new ApiError("Invalid email", 400, validatedData.errors)
    }

    const user = await findUserByEmail(validatedData.data.email)

    if (!user) {
        throw new ApiError("User not found", 404, [{ field: "email", message: "user not found" }])
    }

    const unhashedToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(unhashedToken)
        .digest("hex");


    const passwordResetTokenSaved = await savepasswordResetToken(hashedToken, user.id)

    if (!passwordResetTokenSaved) {
        throw new ApiError("Failed to save password reset token.", 500, [{
            field: 'user',
            message: 'user could not be created'
        }]);
    }

    const url = `http://localhost:3000/auth/reset-password?token=${unhashedToken}`;
    const emailsent = await sendEmail(url, user.email, sendEmailENUM.FORGOT_PASSWORD);

    if (!emailsent.success) {
        throw new ApiError("Failed to send password reset email.", 500, [{
            field: 'email',
            message: 'failed to send password reset email'
        }])
    }

    return {
        success: true,
        message: "Password reset email sent successfully.",
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            country_code: user.country_code,
            global_role: user.global_role,
            is_email_verified: user.is_email_verified,
            avatar_url: user.avatar_url
        },

    }








}

import { updatePasswordById } from "../repositories/user.repository";
export const resetPassword = async (token: string, password: string) => {


    const hashed_token=crypto.createHash("sha256")
    .update(token)
    .digest("hex")

    const tokenEntry = await findPasswordResetToken(hashed_token);

    if (!tokenEntry) {
        throw new ApiError("token is invalid", 400, [{ field: "token", message: "invalid or expired password reset token" }])
    }

    const userid = tokenEntry.user_id;

    const hashed_password=await bcrypt.hash(password,10);

    const user = await updatePasswordById(userid, hashed_password);

    if (!user) {
        throw new ApiError("user not found", 404, [{ field: "user", message: "user not found" }])
    }
    
    await deletePasswordResetTokens(userid);
    await deletJWTfromDB(userid)

    return {
        success: true,
        message: "Password reset token is valid.",
        user: user,

    }


}

export const refreshAccessToken = async (refreshToken: string) => {
    if (!refreshToken) {
        throw new ApiError("Unauthorized", 401, [
            { field: "token", message: "token is required" }
        ]);
    }

    const secretString = process.env.REFRESH_TOKEN_SECRET;
    if (!secretString) {
        throw new ApiError("Refresh token secret not found", 500);
    }

    const secret = new TextEncoder().encode(secretString);

    type RefreshJwtPayload = {
        id: string;
        username: string;
        email: string;
        role: string;
    };

    let payload: RefreshJwtPayload;

    try {
        const res = await jwtVerify<RefreshJwtPayload>(refreshToken, secret);
        payload = res.payload;
    } catch (error) {
        if (error instanceof JWTExpired) {
            throw new ApiError("Unauthorized", 401, [
                { field: "token", message: "TOKEN_EXPIRED" }
            ]);
        }
        if (error instanceof JWTInvalid) {
            throw new ApiError("Unauthorized", 401, [
                { field: "token", message: "TOKEN_INVALID" }
            ]);
        }
        throw new ApiError("Unauthorized", 401, [
            { field: "token", message: "TOKEN_INVALID" }
        ]);
    }

    if (!payload || !payload.id) {
        throw new ApiError("Unauthorized", 401, [
            { field: "token", message: "TOKEN_INVALID" }
        ]);
    }

    // Verify token exists in DB (not revoked).
    const existingTokenInDB = await findRefreshTokenInDB(refreshToken);
    if (!existingTokenInDB) {
        throw new ApiError("Unauthorized", 401, [
            { field: "token", message: "TOKEN_INVALID" }
        ]);
    }

    const user = await findUserbyId(payload.id);
    if (!user) {
        throw new ApiError("User not found", 404, [
            { field: "user", message: "user not found" }
        ]);
    }

    // --- ROTATION ---
    // Delete the old refresh token first (single-use guarantee).
    // If saving the new one fails below, the old one is already gone which
    // forces re-login — the safe failure mode.
    await deletJWTfromDB(user.id);

    // Generate a brand-new access token + refresh token pair.
    const { accessToken, refreshToken: newRefreshToken } = await generateJwtTokens(user.id);

    // Persist the new refresh token.
    const saved = await saveRefreshTokenInDB(newRefreshToken, user.id);
    if (!saved) {
        throw new ApiError("Failed to rotate refresh token", 500, [
            { field: "token", message: "Could not save new refresh token" }
        ]);
    }

    return {
        accessToken,
        refreshToken: newRefreshToken,
        user
    };
};



