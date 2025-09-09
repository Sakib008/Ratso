import prisma from "../../prismaClient.js";
import type { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const user = await prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        res.status(200).json({ message: "User profile fetched successfully", user });

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const user = await prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const updateData = await prisma.user.update({
            where: { id: Number(id) },
            data: req.body
        });
        res.status(200).json({ message: "User profile updated successfully", updateData });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMe = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    res.status(200).json({ message: "User profile fetched successfully", user });
};