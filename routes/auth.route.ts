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
<<<<<<< HEAD
router.get("/me", authVerify, getMe);
=======
router.post("/me", authVerify, getMe);
>>>>>>> 777c897bbc7ee34e82a91cac50c7165b1f0e1b36
router.post("/logout", authVerify, logoutUser);

export default router;
