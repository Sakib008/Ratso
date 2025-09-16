import prisma from "../../prismaClient.js";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import type { User } from "../../prisma/types.js";
import { generateToken } from "../../helpers/generateJwtToken.js";

export const loginUser = async (req:Request, res:Response) => {
    const { email, password } = req.body as User;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await prisma.user.findUnique({ where: { email } }) as User;
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

        const token = generateToken(user.id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });
        
        return res.status(200).json({ message: "Login successful"});
    } catch (error) {
        console.error("Error during user login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


