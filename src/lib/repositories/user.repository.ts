import { inputData_type } from "../validators/auth.validators"
import pool from "../db"

type userDataType={
    name:string,
    email:string,
    password_hash:string,
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
        mobile,
        country_code,
        global_role,
        is_email_verified

        ) values
         ($1,$2,$3,$4,$5,$6,$7)

         RETURNING id,
        name,
        email,
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
            userdata.mobile,
            userdata.country_code,
            userdata.global_role,
            userdata.is_email_verified
        ]
    )

    return result.rows[0];



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
    return result.rows[0];
}


