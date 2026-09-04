"use client"
import { GoogleOAuthProvider } from "@react-oauth/google"

export const Providers = ({ children }: { children: React.ReactNode }) => {

    return(
        <GoogleOAuthProvider
        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>

        {children}

        </GoogleOAuthProvider>
    )

}
    
    