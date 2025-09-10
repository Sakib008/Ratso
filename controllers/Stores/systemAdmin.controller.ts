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
    const {id} = req.user as User;

    try {
        const authorisedUser : User = await prisma.user.findUnique({
            where : { id },
            select: { role: true }
        });
        if (!authorisedUser || authorisedUser.role !== Role.ADMIN) {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }
        const totalStores : number = await prisma.store.count();
      const stores : Store[] = await prisma.store.findMany({
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