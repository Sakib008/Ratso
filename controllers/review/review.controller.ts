import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import dotenv from "dotenv";

import prisma from "../../prismaClient.js";
import { Role } from "../../generated/prisma/index.js";
import type { Review, User, Store } from "../../prisma/types.js";
dotenv.config();

export const getAllReviews = async (req: Request, res: Response) => {
    const {page = '1', limit= "10"} = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const userId = req.user?.id as number;
    if (isNaN(pageNumber) || isNaN(limitNumber)) {
        return res.status(400).json({ message: "Invalid page or limit number" });
    }

    try {
        const authorisedUser : User = await prisma.user.findUnique({
            where : { id: userId },
            select: { role: true }
        });
        if (!authorisedUser || authorisedUser.role !== Role.ADMIN) {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }
        const totalReviews : number = await prisma.review.count();
      const reviews : Review[] = await prisma.review.findMany({
        skip: (Number(page) || 1) - 1,
        take: Number(limit) || 10,
       select : {
           id: true,
           rating: true,
           comment: true,
           user: true,
           store: true
       }
       
      })
        res.status(200).json({ page: Number(page) || 1, limit: Number(limit) || totalReviews, total : totalReviews, reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createReview = async (req: Request, res: Response) => {
    const user = req.user as User;
    try {
        if (!user || user.role !== Role.ADMIN && user.role !== Role.USER) {
            return res.status(403).json({ message: "Forbidden: Only User and Admins can create reviews" });
        }
        const { rating, comment, storeId } = req.body as Review;
        if (!rating || !storeId ) {
            return res.status(400).json({ message: "Rating and store ID are required" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }
        const store : Store = await prisma.store.findUnique({
            where: { 
                id: storeId,
            },
            include: {
                reviews: true
            }
        });
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }
        if (store.status !== 'APPROVED') {
            return res.status(400).json({ message: "Cannot review a store that is not approved" });
        }
        const existingReview : Review = await prisma.review.findUnique({
            where: {
                userId_storeId: {
                    userId: user.id,
                    storeId
                }
            }
        });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this store" });
        }
        const review : Review = await prisma.review.create({
            data: {
                rating,
                comment,
                userId : user.id,
                storeId
            },
            include: {
                user: true,
                store: true
            }
        });
        res.status(201).json({
            message: "Review created successfully",
            review
        });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateReview = async (req: Request, res: Response) => {
    const user = req.user as User;
    try {
        
        if (!user || (user.role !== Role.ADMIN && user.role !== Role.USER)) {
            return res.status(403).json({ message: "Forbidden: Only User and Admins can update reviews" });
        }
        const { rating, comment, id } : Review = req.body;
        if (!rating || !id ) {
            return res.status(400).json({ message: "Rating and review ID are required" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }
        const review : Review = await prisma.review.findUnique({
            where: { 
                id: Number(id),
            },
            include: {
                user: true,
                store: true
            }
        });
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (review.userId !== Number(user.id)) {
            return res.status(403).json({ message: "You are not authorized to update this review" });
        }
        const updatedReview = await prisma.review.update({
            where: { id },
            data: {
                rating,
                comment
            }
        });
        res.status(200).json({
            message: "Review updated successfully",
            updatedReview
        });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteReview = async (req: Request, res: Response) => {
   const user = req.user as User;
    try {
      if (!user || user.role !== Role.ADMIN && user.role !== Role.USER) {
            return res.status(403).json({ message: "Forbidden: Only User and Admins can delete reviews" });
        }
        const { id } = req.query;
        if (!id ) {
            return res.status(400).json({ message: "Review ID is required" });
        }
        const review : Review = await prisma.review.findUnique({
            where: { 
                id,
            },
            include: {
                user: true,
                store: true
            }
        });
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (review.userId !== user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }
        const deletedReview : Review = await prisma.review.delete({
            where: { id }
        });
        res.status(200).json({
            message: "Review deleted successfully",
            review : deletedReview
        });
    } catch (error) {
        console.error("Error deleting review:", error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllReviewsByStore = async (req: Request, res: Response) => {
    const user = req.user as User;
    try {
     const review : Review[] = await prisma.review.findMany({
            where: { 
                storeId: Number(req.query.storeId),
            },
            include: {
                user: true,
                store: true
            }
        });
        if(user.role !== Role.ADMIN){
            return res.status(403).json({ message: "Forbidden: Only Admins can fetch reviews by store" });
        }
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }  
        res.status(200).json({
            message: "Reviews fetched successfully",
            reviews: review
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};