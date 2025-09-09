import prisma from "../../prismaClient.js";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import { Role } from "../../generated/prisma/index.js";
dotenv.config();

export const getAllStores = async (req: Request, res: Response) => {
    const {page, limit} = req.query;
    const userId = req.user?.id;
    if (page && isNaN(Number(page))) {
        return res.status(400).json({ message: "Invalid page number" });
    }
    if (limit && isNaN(Number(limit))) {
        return res.status(400).json({ message: "Invalid limit number" });
    }

    try {
        const authorisedUser = await prisma.user.findUnique({
            where : { id: userId },
            select: { role: true }
        });
        if (!authorisedUser || authorisedUser.role !== Role.ADMIN) {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }
        const totalStores = await prisma.store.count();
      const stores = await prisma.store.findMany({
        skip: (Number(page) || 1) - 1,
        take: Number(limit) || 10,
       select : {
           id: true,
           name : true,
           address : true,
           email : true,
           rating : true
       }
      })
        res.status(200).json({ page: Number(page) || 1, limit: Number(limit) || totalStores, total : totalStores, stores });
    } catch (error) {
        console.error("Error fetching stores:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};