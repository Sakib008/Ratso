import prisma from "../../prismaClient.js";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import type { User } from "../../prisma/types.js";

export const loginUser = async (req:Request, res:Response) => {
    const { email, password } : User = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user : User= await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        const isEmailVerified = user.isEmailVerified;
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        if (!isEmailVerified) {
            return res.status(400).json({ message: "Please verify your email before logging in" });
        }
        
        return res.status(200).json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage } });
    } catch (error) {
        console.error("Error during user login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


