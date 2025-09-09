import prisma from "../../prismaClient.js";
import type { Request, Response } from "express";

export const searchStore = async (req: Request, res: Response) => {
    try {
        const {search} = req.query;
        if (!search) {
            return res.status(400).json({ message: "Search term is required" });
        }
        const stores = await prisma.store.findMany({
            where: {
                OR: [
                    { name: { contains: search } },
                    { address: { contains: search } },
                ]
            }
        });
        res.status(200).json({ message: "Stores found", stores });
    } catch (error) {
        console.error("Error fetching stores:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
