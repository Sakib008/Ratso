import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient.js";
import type { User } from "../prisma/types.js";

export const authVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  const jwtSecret = process.env.JWT_SECRET as string;
  if (!jwtSecret) {
    return res.status(500).json({ message: "JWT secret not configured" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await prisma.user.findUnique({
      where: {
        id: Number(decoded.userId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    req.user = user as User;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
