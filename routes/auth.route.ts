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
import { logoutUser } from "../controllers/auth/login.controller.js";
const router = express.Router();

router.post("/signup", createUserRequest);
router.post("/verify-token", verifyToken);
router.post("/login", loginUser);

router.post("/change-password", authVerify, changePassword);
router.post("/reset-password", resetPasswordRequest);
router.post("/reset-password/:token", resetPassword);
router.get("/me", authVerify, getMe);
router.post("/logout", authVerify, logoutUser);

export default router;
