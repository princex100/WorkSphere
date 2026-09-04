import { inputData_type } from "../validators/auth.validators"
import pool from "../db"

type userDataType={
    name:string,
    email:string,
    password_hash:string,
    avatar_url:string,

    mobile:string,
    country_code:string,
    global_role:string,
    is_email_verified:boolean
}
export const createUserInDB=async(userdata:userDataType)=>{

   const result = await pool.query(

        `INSERT INTO users(
        name,
        email,
        password_hash,
        avatar_url,
        mobile,
        country_code,
        global_role,
        is_email_verified
        ) values
         ($1,$2,$3,$4,$5,$6,$7)

         RETURNING id,
        name,
        email,
        avatar_url,
        mobile,
        country_code,
        global_role,
        is_email_verified,
        created_at,
        updated_at`,
        [
            userdata.name,
            userdata.email,
            userdata.password_hash,
            userdata.avatar_url || "",
            userdata.mobile,
            userdata.country_code,
            userdata.global_role,
            userdata.is_email_verified
        ]
    )

    return result.rows[0] ?? null;



}

export const saveHashedToken=async(token:string,user_id:string)=>{
    const result=await pool.query(
        `INSERT INTO email_verification_tokens(
            token,
            user_id,
            expires_at
        )
        VALUES(
            $1,
            $2,
            $3
        ) 
        RETURNING id,
        token,
        user_id,
        expires_at`,

        [token,user_id,new Date(Date.now()+15*60*1000)]
    )
    return result.rows[0] ?? null;
}

export const findUserbyId=async(id:string)=>{
    const result=await pool.query(
        `SELECT 
        id,
        name,
        email,
        mobile,
        country_code,
        global_role,
        is_email_verified,
        created_at,
        updated_at
        FROM users WHERE id=$1
        `,
        [id]
    )
    
    return result.rows[0] ?? null;
}

export const findEmailToken=async(token:string)=>{
    const result=await pool.query(
        `SELECT * FROM email_verification_tokens WHERE token=$1 AND expires_at > CURRENT_TIMESTAMP`,
        [token]
    )
    return result.rows[0] ?? null;
}


export const updateUserInDB=async(userId:string,user:userDataType)=>{
    const result=await pool.query(
        `UPDATE users SET 
        is_email_verified=$1,
        updated_at=CURRENT_TIMESTAMP
        WHERE id=$2

        RETURNING 
        id,
        name,
        email,
        mobile,
        country_code,
        global_role,
        is_email_verified,
        created_at,
        updated_at`,
        [
           true,
            userId
        ]
    )
    return result.rows[0] ?? null;
}

export const deletePreviousTokens=async(userid:string)=>{
      await pool.query(
        ` DELETE FROM email_verification_tokens 
        WHERE user_id=$1`,[userid]
    )

    return {success:true,message:"previous tokens deleted successfully."}
}

export const saveRefreshTokenInDB=async(token:string,user_id:string)=>{
    const result=await pool.query(
        `INSERT INTO refresh_tokens(
            token,
            user_id,
            expires_at
        )
        VALUES(
            $1,
            $2,
            $3
        ) 
       
        RETURNING id,
        token,
        user_id,
        expires_at`,

        [token,user_id,new Date(Date.now()+7*24*60*60*1000)]
    )
    return result.rows[0] ?? null;
}

export const findUserByEmail=async(email:string)=>{

    const result=await pool.query(
        `SELECT * FROM users WHERE email=$1`,
        [email]
    )
    return result.rows[0] ?? null;
}



