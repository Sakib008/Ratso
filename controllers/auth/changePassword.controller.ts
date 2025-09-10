import bcrypt from "bcryptjs";
import type { Request, Response } from "express";

import prisma from "../../prismaClient.js";
import type { User } from "../../prisma/types.js";
export const changePassword = async (req: Request, res: Response) => {
    interface ChangePasswordRequest {
        currentPassword: string;
        newPassword: string;
    }
    
    const { currentPassword, newPassword } : ChangePasswordRequest = req.body;
    const user = req.user as User;
    try {
        if(!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        console.error("Error changing password:", error as Error);
        return res.status(500).json({ message: "Internal server error" });
    }
};