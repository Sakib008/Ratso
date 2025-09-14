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
    const store = await prisma.store.findUnique({
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
  try {
    const userId = req.user?.id as User["id"];
    const authorisedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      !authorisedUser ||
      (authorisedUser.role !== Role.ADMIN &&
        authorisedUser.role !== Role.STORE_OWNER)
    ) {
      return res.status(403).json({ message: "Forbidden: Admins and Store Owners only" });
    }

    const { name, address, storeOwnerId, description } = req.body;

    let storeImageUrl = null;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      if (uploadResult.success && uploadResult.data?.secure_url) {
        storeImageUrl = uploadResult.data.secure_url;
      }
    }

    if (!name || !address || !storeOwnerId) {
      return res.status(400).json({ message: "Name, address, and storeOwnerId are required" });
    }

    const existingStore = await prisma.store.findFirst({
      where: {
        name,
        storeOwnerId,
      },
    });

    if (existingStore) {
      return res.status(400).json({ message: "Store already exists with this name and owner" });
    }

    const store = await prisma.store.create({
      data: {
        name,
        address,
        storeOwnerId,
        description,
        storeImage: storeImageUrl,
        // status will default to PENDING
      },
    });

    return res.status(201).json({
      message: "Store created successfully with PENDING status",
      store,
    });
  } catch (error) {
    console.error("Error during store creation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteStore = async (req: Request, res: Response) => {
  const {id} = req.query;
  const userId = req.user?.id as User["id"];
  try {
    const authorisedUser = await prisma.user.findUnique({
      where: { id : userId },
      select: { role: true },
    });
    if (
      !authorisedUser ||
      (authorisedUser.role !== Role.ADMIN &&
      authorisedUser.role !== Role.STORE_OWNER)
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
  const userId = req.user?.id as User["id"];
  try {
    const authorisedUser = await prisma.user.findUnique({
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
    const storeId = Number(id);
    if (!storeId || isNaN(Number(storeId))) {
      return res.status(400).json({ message: "Id is required" });
    }
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    const updateData = await prisma.store.update({
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
