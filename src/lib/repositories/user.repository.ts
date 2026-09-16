import { inputData_type } from "../validators/auth.validators"
import pool from "../db"

type userDataType = {
    name: string,
    username?: string,
    email: string,
    password_hash: string,
    avatar_url: string,

    mobile: string,
    country_code: string,
    global_role: string,
    is_email_verified: boolean
}
export const createUserInDB = async (userdata: userDataType) => {

    const result = await pool.query(

        `INSERT INTO users(
        name,
        username,
        email,
        password_hash,
        avatar_url,
        mobile,
        country_code,
        global_role,
        is_email_verified
        ) values
         ($1,$2,$3,$4,$5,$6,$7,$8,$9)

         RETURNING id,
        name,
        username,
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
            userdata.username || null,
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

export const createUserWithPersonalWorkspaceInDB = async (
    userdata: userDataType,
    workspaceName?: string
) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Create user
        const userResult = await client.query(
            `INSERT INTO users(
                name,
                username,
                email,
                password_hash,
                avatar_url,
                mobile,
                country_code,
                global_role,
                is_email_verified
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, name, username, email, avatar_url, mobile, country_code, global_role, is_email_verified, created_at, updated_at`,
            [
                userdata.name,
                userdata.username || null,
                userdata.email,
                userdata.password_hash,
                userdata.avatar_url || "",
                userdata.mobile,
                userdata.country_code,
                userdata.global_role,
                userdata.is_email_verified
            ]
        );

        const createdUser = userResult.rows[0];
        if (!createdUser) {
            throw new Error("Failed to create user in database transaction");
        }

        // 2. Create personal workspace for the user
        const finalWorkspaceName =
            workspaceName || `${userdata.name ? userdata.name : "Personal"}'s Workspace`;

        const workspaceResult = await client.query(
            `INSERT INTO workspaces (name, type, created_by)
             VALUES ($1, 'SOLO', $2)
             RETURNING id, name, type, created_by, created_at, updated_at`,
            [finalWorkspaceName, createdUser.id]
        );

        const createdWorkspace = workspaceResult.rows[0];
        if (!createdWorkspace) {
            throw new Error("Failed to create personal workspace in database transaction");
        }

        // 3. Add user as OWNER member of the workspace
        await client.query(
            `INSERT INTO workspace_members (workspace_id, user_id, role)
             VALUES ($1, $2, 'OWNER')`,
            [createdWorkspace.id, createdUser.id]
        );

        await client.query("COMMIT");

        return {
            user: createdUser,
            workspace: createdWorkspace
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const saveHashedToken = async (token: string, user_id: string) => {
    const result = await pool.query(
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

        [token, user_id, new Date(Date.now() + 15 * 60 * 1000)]
    )
    return result.rows[0] ?? null;
}

export const findUserbyId = async (id: string) => {
    const result = await pool.query(
        `SELECT 
        id,
        name,
        username,
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

export const findEmailToken = async (token: string) => {
    const result = await pool.query(
        `SELECT * FROM email_verification_tokens WHERE token=$1 AND expires_at > CURRENT_TIMESTAMP`,
        [token]
    )
    return result.rows[0] ?? null;
}


export const updateUserInDB = async (userId: string, user: userDataType) => {
    const result = await pool.query(
        `UPDATE users SET 
        is_email_verified=$1,
        updated_at=CURRENT_TIMESTAMP
        WHERE id=$2

        RETURNING 
        id,
        name,
        username,
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

export const deletePreviousTokens = async (userid: string) => {
    await pool.query(
        ` DELETE FROM email_verification_tokens 
        WHERE user_id=$1`, [userid]
    )

    return { success: true, message: "previous tokens deleted successfully." }
}

export const saveRefreshTokenInDB = async (token: string, user_id: string) => {
    const result = await pool.query(
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

        [token, user_id, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    )
    return result.rows[0] ?? null;
}

export const findUserByEmail = async (email: string) => {

    const result = await pool.query(
        `SELECT * FROM users WHERE email=$1`,
        [email]
    )
    return result.rows[0] ?? null;
}

export const findUserByUsername = async (username: string) => {

    const result = await pool.query(
        `SELECT * FROM users WHERE username=$1`,
        [username]
    )
    return result.rows[0] ?? null;
}

export const findUserByUsernameOrEmail = async (credential: string) => {

    const result = await pool.query(
        `SELECT * FROM users WHERE email=$1 OR username=$1`,
        [credential]
    )
    return result.rows[0] ?? null;
}

export const deletJWTfromDB = async (userid: string) => {

    const result = await pool.query(
        `DELETE FROM refresh_tokens WHERE user_id=$1`,
        [userid]
    )

    return true

}

export const savepasswordResetToken = async (token: string, user_id: string) => {
    const result = await pool.query(
        `INSERT INTO password_reset_tokens(
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

        [token, user_id, new Date(Date.now() + 15 * 60 * 1000)]
    )
    return result.rows[0] ?? null;
}


export const updatePasswordById = async (userid: string, password: string) => {

    const result = await pool.query(
        `UPDATE  users SET password_hash=$1 WHERE id=$2
         RETURNING id,
        name,
        username,
        email,
        avatar_url,
        mobile,
        country_code,
        global_role,
        is_email_verified,
        created_at,
        updated_at 
        `,
        [password, userid]
    )

    return result.rows[0] ?? null;
}

export const findPasswordResetToken = async (token: string) => {
    const result = await pool.query(
        `SELECT *
         FROM password_reset_tokens 
         WHERE token=$1 AND expires_at > CURRENT_TIMESTAMP
         `,
        [token]
    )
    return result.rows[0] ?? null;
}

export const deletePasswordResetTokens = async (userid: string) => {
    await pool.query(
        `DELETE FROM password_reset_tokens WHERE user_id=$1`,
        [userid]
    )
    return true

}

export const findRefreshTokenInDB = async (token: string) => {
    const result = await pool.query(
        `SELECT *
         FROM refresh_tokens
         WHERE token=$1 AND expires_at > CURRENT_TIMESTAMP`,
        [token]
    );
    return result.rows[0] ?? null;
};




