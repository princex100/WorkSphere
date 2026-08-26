import { z } from "zod"


const validSchema = z.object({
        name: z.string()
            .min(2, "Name must be at least 2 characters")
            .regex(
                /^[A-Za-z ]+$/,
                "Name can contain only letters and spaces"
            ),
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

export const registerValidator = (data: unknown) => {
    

    const result = validSchema.safeParse(data);


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


    const {name,email,password,country_code,mobile}=result.data;

    

    return {
        success:true as const,
        data:{
            name,
            email,
            password,
            country_code,
            mobile
        }
    }

}

export type inputData_type=z.infer<typeof validSchema>