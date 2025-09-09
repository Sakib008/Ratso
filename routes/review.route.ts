import {getAllReviews,createReview,updateReview,deleteReview,getAllReviewsByStore} from '../controllers/index.js';
import express from "express";
const router = express.Router();

router.get('/', getAllReviews);
router.post('/',  createReview);
router.put('/:id',  updateReview);
router.delete('/:id',  deleteReview);
router.get('/:storeId',  getAllReviewsByStore);

export default router;