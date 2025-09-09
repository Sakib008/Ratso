import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient.js";
import cookie from "cookiejs";

export const authVerify = async (req:Request,res:Response,next:NextFunction) => {
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
        const decoded = jwt.verify(token, jwtSecret) as { userId: string };
        if(!decoded.userId) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const user = await prisma.user.findUnique({
            where: {
                id: Number(decoded.userId),
            },
            select : {
                id : true,
                name : true,
                email : true,
                role : true,
                profileImage : true
            }
        });
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};