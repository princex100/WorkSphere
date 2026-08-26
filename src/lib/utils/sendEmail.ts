import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const mailgenContent=(url:string,username:string)=>{
    
     const mailgenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'TaskMaster',
            link: 'https://www.google.com',
            
        }
    })

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

export const sendEmail=async(token:string,email:string)=>{
    
   

  const url=`http://localhost:3000/auth/verify-email?token=${token}`;
  console.log("the url is",url);
  
  const {textcontent,htmlcontent}=mailgenContent(url,email);
   
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
        subject:"Verify Your Email",
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
            message:"email verification could not be sent.",
            
        }
    }



        
 

}