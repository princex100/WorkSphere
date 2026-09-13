import { string, z } from "zod"


const validRegisterSchema = z.object({
        name: z.string()
            .min(2, "Name must be at least 2 characters")
            .regex(
                /^[A-Za-z ]+$/,
                "Name can contain only letters and spaces"
            ),
        username: z.string()
            .min(3, "Username must be at least 3 characters")
            .max(50, "Username too long")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores"
            )
            .optional(),
        email: z.string()
            .email({ message: "invalid email address." })
            .toLowerCase()
            .trim(),
        password: z.string()
            .min(8, { message: "password too short." })
            .max(255, { message: "password too long." }),
        country_code: z.string()
            .regex(/^\+\d{1,4}$/, "Invalid country code"),

        mobile: z.string()
            .regex(/^\d{6,15}$/, "Invalid phone number")
    })

const validLoginSchema=z.object({
    credential:z.string()
    .email({ message: "invalid email address." })
    .toLowerCase()
    .trim()
    .or(
        z.string()
            .min(3, "Username must be at least 3 characters")
            .max(50, "Username too long")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores"
            )
    ),
    password: z.string()
            .min(8, { message: "password too short." })
            .max(255, { message: "password too long." })
})

export const registerValidator = (data: unknown) => {
    

    const result = validRegisterSchema.safeParse(data);


    if (!result.success) {
        
        type Errors={
            field:string,
            message:string
        }
        const errors:Errors[]=result.error?.issues.map(e=>{
            return {
                field:e.path[0] as string,
                message:e.message
            }
        })
        return {
            success: false as const,
            errors:errors

        }
    }


    const {name,username,email,password,country_code,mobile}=result.data;

    

    return {
        success:true as const,
        data:{
            name,
            username,
            email,
            password,
            country_code,
            mobile
        }
    }

}

export const loginValidator=(data:any)=>{

    
    const result = validLoginSchema.safeParse(data);


    if (!result.success) {
        
        type Errors={
            field:string,
            message:string
        }
        const errors:Errors[]=result.error?.issues.map(e=>{
            return {
                field:e.path[0] as string,
                message:e.message
            }
        })
        return {
            success: false as const,
            errors:errors

        }
    }


    const {credential,password}=result.data;

    

    return {
        success:true as const,
        data:{
            credential,
            password
        }
    }

}

export const emailValidator=(email:string)=>{

    const emailSchema=z.string().email("invalid email address.").toLowerCase().trim();
        


    const result=emailSchema.safeParse(email)

    if(!result.success){

        type errorschema={
            field:string,
            message:string
        }
        const errors:errorschema[]=result.error.issues.map(issue=>{
            return {
                field:"email",
                message:issue.message
            }
        })
        return {
            success:false as const,
            errors:errors
        }
    }

    return {
        success:true as const,
        data:{
            email:result.data
        }
    }
    
}

export type inputData_type=z.infer<typeof validRegisterSchema> | z.infer<typeof validLoginSchema>