import prisma from "../../prismaClient.js";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import { Role } from "../../generated/prisma/index.js";
dotenv.config();

export const getAllUsers = async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const userId = req.user?.id;
  if (page && isNaN(Number(page))) {
    return res.status(400).json({ message: "Invalid page number" });
  }
  if (limit && isNaN(Number(limit))) {
    return res.status(400).json({ message: "Invalid limit number" });
  }
  try {
    const authorisedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: Role.ADMIN },
    });
    if (!authorisedUser || authorisedUser.role !== Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    const users = await prisma.user.findMany({
      skip: (Number(page) || 1) - 1,
      take: Number(limit) || 10,
      select: {
        id: true,
        email: true,
        name: true,
        address: true,
        role: true,
      },
    });
    res
      .status(200)
      .json({
        page: Number(page) || 1,
        limit: Number(limit) || users.length,
        total: users.length,
        users,
      });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
