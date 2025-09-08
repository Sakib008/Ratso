import prisma from "../../prismaClient.js";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import { Role } from "../../generated/prisma/index.js";
dotenv.config();

export const getAllUsers = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header missing or malformed" });
    }
    const {page, limit} = req.query;
    if (page && isNaN(Number(page))) {
        return res.status(400).json({ message: "Invalid page number" });
    }
    if (limit && isNaN(Number(limit))) {
        return res.status(400).json({ message: "Invalid limit number" });
    }
    const token = authHeader.split(" ")[1] as string;
    const jwtSecret = process.env.JWT_SECRET as string;
    if(!jwtSecret) {
        return res.status(500).json({ message: "JWT secret not configured" });
    }

    try {
        jwt.verify(token, jwtSecret);
        const decoded  = jwt.verify(token, jwtSecret) as { userId: string };
        const userId = decoded.userId;
        const authorisedUser = await prisma.user.findUnique({
            where : { id: userId },
            select: { role: Role.ADMIN }
        });
        if (!authorisedUser || authorisedUser.role !== Role.ADMIN) {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                address: true,
                role: true, 
            }
        });
        const paginatedUsers = users.slice(((Number(page) || 1) - 1) * (Number(limit) || users.length), (Number(page) || 1) * (Number(limit) || users.length));
        res.status(200).json({ page: Number(page) || 1, limit: Number(limit) || users.length, total : users.length, users: paginatedUsers });
    } catch (error) {
        console.error("Error fetching users:", error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};