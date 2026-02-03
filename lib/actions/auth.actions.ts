'use server';

import { auth } from "@/lib/better-auth/auth";
import { inngest } from "../inngest/client";
import { headers } from "next/headers";

export const signUpWithEmail = async ({email, password, fullName, country, investmentGoals, preferredIndustry, riskTolerance}: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail ({
            body: {
                email,
                password,
                name: fullName
            }
        })
        if(response){
            await inngest.send({
                name: 'app/user.created',
                data: {
                    email,
                    name: fullName,
                    country,
                    investmentGoals,
                    riskTolerance,
                    preferredIndustry
                    }
                })
            }

            return { success: true, message: 'User signed up successfully' , data: response};
    } catch (error) {
        console.error("Sign-up error:", error);
        throw error;
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({headers: await headers()});
    }
    catch (error) {
        console.error("Sign-out error:", error);
        return {success: false, message: 'Sign out failed'}
    }
}

export const signInWithEmail = async ({email, password}: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail ({
            body: {
                email,
                password,
            }
        })
            return { success: true, message: 'User signed in successfully' , data: response};
    } catch (error) {
        console.error("Sign-in error:", error);
        return {success: false, message: error instanceof Error ? error.message : 'Sign in failed'  }
    }
}