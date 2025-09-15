import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";
import VerificationEmail from "./email/VerificationEmail.js";
import type { ApiResponse } from "../Types/apiResponse.js";
const resend = new Resend(process.env.RESEND_API_KEY);
export const sendEmailVerification = async (email:string,name: string, verifyCode: string):Promise<ApiResponse> =>{
    try {
        await resend.emails.send({
  from: 'Ratso <no-reply@mohammadsakib.me>',
  to: [email],
  subject: 'Verification Code | Ratso',
  react: VerificationEmail({ name, otp: verifyCode }),
});
        return {
            success: true,message : "Verification Email Send Successfully "
        }
    } catch (error) {
        console.error("Error sending email:", error);
        return {
            success: false,message : "Error in Sending Verification Email"
        }
    }
};