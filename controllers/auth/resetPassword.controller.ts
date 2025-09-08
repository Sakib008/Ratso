import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import prisma from "../../prismaClient.js";
import { sendResetPassword } from "../../helpers/sendResetPassword.js";

export const resetPasswordRequest = async (req:Request, res:Response) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "User with this email does not exist" });
        }
        const tempToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        user.temporaryToken = tempToken;
        user.temporaryTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.user.update({
            where: { email },
            data: user 
        });
        
        const tokenLink = `${process.env.FRONTEND_URL}/reset-password?token=${tempToken}`;
        const emailResponse = await sendResetPassword(email, user.name, tokenLink);
        console.log("Reset password email sent response:", emailResponse);
        return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req:Request, res:Response) => {
    const {newPassword } = req.body;
    const token = req.query.token as string;
    try {
        if (!token) {
            return res.status(400).json({ message: "Reset Token is required" });
        }
        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }
        if(newPassword.length < 8){
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }
        if(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/.test(newPassword)){
            return res.status(400).json({ message: "Password must contain 1 uppercase, 1 special, 1 number and minimum 8 character upto max 20" });
        }
       const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, iat: number, exp: number };
       const userId = decoded.userId;
       const user = await prisma.user.findUnique({ where: { id: userId } });
         if (!user || user.temporaryToken !== token || !user.temporaryTokenExpiry || user.temporaryTokenExpiry < new Date()) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.temporaryToken = null;
        user.temporaryTokenExpiry = null;
        await prisma.user.update({
            where: { id: userId },
            data: user 
        });
        return res.status(200).json({ message: "Password has been reset successfully" });

    }catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};