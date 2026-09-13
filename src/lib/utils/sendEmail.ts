import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import path from "path";
import { sendEmailENUM } from "@/constants";
import { ApiError } from "../errors/ApiError";

 const mailgenerator = new Mailgen({
        theme: {
            path:path.join(
                process.cwd(),
                "node_modules/mailgen/themes/default/index.html"
            )
            ,
            plaintextPath:path.join(
                process.cwd(),
                "node_modules/mailgen/themes/default/index.txt"
            )

        },
        product: {
            name: 'TaskMaster',
            link: 'https://www.google.com',
            
        }
    })

const RegisterMailgenContent=(url:string,username:string)=>{
    
    

    const content={
    body: {
        name: username,

        intro: [
            "Welcome to WorkSphere!",
            "Thanks for creating your account. Please verify your email address to activate your account."
        ],

        action: {
            instructions: "Click the button below to verify your email:",
            button: {
                color: "#24ac3fff",
                text: "Verify Email",
                link: url
            }
        },

        outro: [
            "This verification link will expire in 15 minutes.",
            "If you did not create this account, you can safely ignore this email."
        ]
    }
}
    const textcontent=mailgenerator.generatePlaintext(content);
    const htmlcontent=mailgenerator.generate(content);

    return {textcontent,htmlcontent}

}

const forgotPasswordMailContent=(url:string,username:string)=>{
    


    const content={
      body: {
     name: username,

    intro: "We received a request to reset your WorkSphere account password.",

    action: {
      instructions:
        "Click the button below to create a new password. This link will expire in 15 minutes.",
      button: {
        color: "#3869D4",
        text: "Reset Password",
        link: url,
      },
    },

    outro:
      "If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.",
  },
}
    const textcontent=mailgenerator.generatePlaintext(content);
    const htmlcontent=mailgenerator.generate(content);

    return {textcontent,htmlcontent} ;

}

export const sendEmail=async(url:string,email:string,emailType:string)=>{
    
   
  let mailgenContent;
  let subject;
  

  if(emailType===sendEmailENUM.REGISTER){
     mailgenContent=RegisterMailgenContent(url,email);
     subject="Verify Your Email"
    
  }
  else if(emailType===sendEmailENUM.FORGOT_PASSWORD){
     mailgenContent=forgotPasswordMailContent(url,email);
     subject="Reset Your Password"
  }
  else{
     throw new ApiError("Invalid email type",400,[
        {field:"emailType",message:"invalid email type"}
     ])
  }
   
   const {textcontent,htmlcontent}=mailgenContent;
   
  const transporter=  nodemailer.createTransport({
       service:"gmail",
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    })


    const mail={
        from:process.env.EMAIL_USER,
        to:email,
        subject:subject,
        text:textcontent,
        html:htmlcontent
    }
    try {

         await transporter.sendMail(mail);
         return {
            success:true,
            message:"Email sent successfully."
            
         }

    } catch (error) {
        return {
            success:false,
            message:"email could not be sent.",
            
        }
    }



        
 

}