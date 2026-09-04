import {OAuth2Client} from "google-auth-library"
import { NextRequest, NextResponse } from "next/server"


export const GET=async(request:NextRequest)=>{
   
   const redirectUri ="http://localhost:3000/api/google/callback";


    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
    );

    const authUrl=client.generateAuthUrl({
        access_type:'offline',
        prompt:'consent',
        scope:["email","profile"]
    })
console.log("done");
console.log(authUrl);

    return NextResponse.redirect(authUrl);
    


    

}   
