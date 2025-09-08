import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";
import ResetPassword from "./email/ResetPassword.jsx";
import type { ApiResponse } from "../Types/apiResponse.js";
const resend = new Resend(process.env.RESEND_API_KEY);
export const sendResetPassword = async (email:string,name: string, tokenLink: string):Promise<ApiResponse> =>{
    try {
        await resend.emails.send({
  from: 'Ratso <onboarding@resend.dev>',
  to: email,
  subject: 'Reset Your Password | Ratso',
  react: ResetPassword({ name,tokenLink }),
});
        return {
            success: true,message : "Reset Password Mail Send Successfully "
        }
    } catch (error) {
        console.error("Error sending email:", error);
        return {
            success: false,message : "Error in Sending Verification Email"
        }
    }
};