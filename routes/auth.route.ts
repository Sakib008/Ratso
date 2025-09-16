import express from "express";

import {
  createUserRequest,
  verifyToken,
  loginUser,
  changePassword,
  resetPasswordRequest,
  resetPassword,
  getMe,
} from "../controllers/index.js";
import { authVerify } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", createUserRequest);
router.post("/verify-token", verifyToken);
router.post("/login", loginUser);

router.post("/change-password", authVerify, changePassword);
router.post("/reset-password", resetPasswordRequest);
router.post("/reset-password/:token", resetPassword);
router.post("/getme", authVerify, getMe);

export default router;
