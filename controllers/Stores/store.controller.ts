import type { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import prisma from "../../prismaClient.js";
import { Role } from "../../generated/prisma/index.js";
import { uploadToCloudinary } from "../../helpers/uploadToCloudinary.js";
import { type Store, type User,StoreStatus } from "../../prisma/types.js";

export const getStoreById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const store : Store = await prisma.store.findUnique({
      where: { id: Number(id) },
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json({ message: "Store found", store });
  } catch (error) {
    console.error("Error fetching store:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createStore = async (req: Request, res: Response) => {
  const {id} = req.user as User;
  try {
    const authorisedUser : User = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    if (
      !authorisedUser ||
      (authorisedUser.role !== Role.ADMIN &&
      authorisedUser.role !== Role.STORE_OWNER)
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: Admins and Store Owner only" });
    }
    const { name, address, storeOwnerId, status, description } = req.body as Store;
    let storeImageUrl = null;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      if (uploadResult.success && uploadResult.data?.secure_url) {
        storeImageUrl = uploadResult.data.secure_url;
      }
    }
    if (!name || !address || !storeOwnerId) {
      return res
        .status(400)
        .json({ message: "Name, address, storeOwnerId are required" });
    }
    const existingStore : Store = await prisma.store.findUnique({ where: { name } });
    if (existingStore) {
      if (existingStore.status === StoreStatus.APPROVED) {
        return res
          .status(400)
          .json({ message: "Store already exists with this id" });
      } else {
        return res
          .status(400)
          .json({ message: "Store already exists with this name" });
      }
    } else {
      const store = await prisma.store.create({
        data: {
          name,
          address,
          storeOwnerId,
          description,
          storeImage: storeImageUrl,
          status: StoreStatus.PENDING,
        },
      });
      return res
        .status(201)
        .json({
          message: "Store created successfully with PENDING status",
          store,
        });
    }
  } catch (error) {
    console.error("Error during store creation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteStore = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  try {
    const authorisedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (
      !authorisedUser ||
      authorisedUser.role !== Role.ADMIN ||
      authorisedUser.role !== Role.STORE_OWNER
    ) {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    const { id } = req.query;
    if (!id || !Number(id)) {
      return res.status(400).json({ message: "Id is required" });
    }
    const store = await prisma.store.findUnique({
      where: { id: Number(id) },
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    const reviews = await prisma.review.deleteMany({
      where: { storeId: Number(id) },
    });
    await prisma.store.delete({
      where: { id: Number(id) },
    });
    return res
      .status(200)
      .json({ message: "Store deleted successfully", reviews });
  } catch (error) {
    console.error("Error during store deletion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  try {
    const authorisedUser : User = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (
      !authorisedUser ||
     ( authorisedUser.role !== Role.ADMIN &&
      authorisedUser.role !== Role.STORE_OWNER)
    ) {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    const { id } = req.query;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Id is required" });
    }
    const store : Store = await prisma.store.findUnique({
      where: { id: Number(id) },
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    const updateData : Store = await prisma.store.update({
      where: { id: Number(id) },
      data: req.body,
    });
    return res
      .status(200)
      .json({ message: "Store status updated successfully", updateData });
  } catch (error) {
    console.error("Error during store status update:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
