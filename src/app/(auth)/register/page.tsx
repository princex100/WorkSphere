"use client"
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function Register() {


    const handleoauth=useGoogleLogin({
        onSuccess:async(tokenResponse)=>{
           const response= await axios.post("/api/googleOauth",{
            access_token:tokenResponse.access_token
           });

           if(!response){
            console.log("frontend oAuthToken failed");
            
           }


           const data=response.data;

           console.log(data);
           
            
        },
        onError:()=>{
            console.log("frontend oAuthToken failed");
        }   
    })
    return (

        <div>
            <button
            onClick={()=>handleoauth()}
            >
click
            </button>
         <h1>Register</h1>
        </div>
    );
}