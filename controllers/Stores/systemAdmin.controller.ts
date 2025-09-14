import prisma from "../../prismaClient.js";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import { Role } from "../../generated/prisma/index.js";
import type { Store, User } from "../../prisma/types.js";
dotenv.config();

export const getAllStores = async (req: Request, res: Response) => {
    interface PageLimit {
        page?: string;
        limit?: string;
    }

    const {page = '1', limit= "10"} = req.query as PageLimit;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
        return res.status(400).json({ message: "Invalid page or limit number" });
    }

    try {
        const totalStores : number = await prisma.store.count();
      const stores  = await prisma.store.findMany({
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber || 10,
      
      })
        res.status(200).json({ page: pageNumber || 1, limit: limitNumber || totalStores, total : totalStores, stores });
    } catch (error) {
        console.error("Error fetching stores:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};