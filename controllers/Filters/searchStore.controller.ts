import type { Request, Response } from "express";

import prisma from "../../prismaClient.js";
import type { Store } from "../../prisma/types.js";
export const searchStore = async (req: Request, res: Response) => {
    try {
        const {search} = req.query;
        if (!search) {
            return res.status(400).json({ message: "Search term is required" });
        }
        if(typeof search !== "string" || search.trim() === ""){
            return [];
        }
        const stores = await prisma.store.findMany({
            where: {
                OR: [
                    { name: { contains: search ,mode: "insensitive" } },
                    { address: { contains: search,mode: "insensitive" } },
                ]
            }
        });
        res.status(200).json({ message: "Stores found", stores });
    } catch (error) {
        console.error("Error fetching stores:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
