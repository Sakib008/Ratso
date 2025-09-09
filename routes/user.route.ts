import {
  getMe,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
} from "../controllers/index.js";
import express from "express";
const router = express.Router();

router.get("/me", getMe);
router.get("/:id", getUserProfile);
router.put("/:id", updateUserProfile);
router.get("/", getAllUsers);

export default router;