import prisma from "../../prismaClient.js";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";


// Define interface for JWT payload
interface JwtPayload  {
    userId: string;
    iat: number;
    exp: number;
}

export const changePassword = async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1] as string;
    const jwtSecret = process.env.JWT_SECRET as string;
    if(!jwtSecret) {
        return res.status(500).json({ message: "JWT secret not configured" });
    }

    try {
        if(!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }

        const decoded  = jwt.verify(token, jwtSecret) as JwtPayload;
        const userId = decoded.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId } 
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid token" });
        }
        console.error("Error changing password:", error as Error);
        return res.status(500).json({ message: "Internal server error" });
    }
};