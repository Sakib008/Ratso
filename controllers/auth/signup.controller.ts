import prisma from "../../prismaClient.js";
import bcrypt from "bcryptjs";
import cookie from "cookiejs";
import type { User } from "../../prisma/types.js";
import type { Request, Response } from "express";

import { uploadToCloudinary } from "../../helpers/uploadToCloudinary.js";
import { sendEmailVerification } from "../../helpers/sendEmailVerification.js";
import { generateToken } from "../../helpers/generateJwtToken.js";

export const createUserRequest = async (req: Request, res: Response) => {
  const {
    name,
    address,
    role,
    verificationToken,
    verificationTokenExpiry,
    email,
    password,
  } : User = req.body;
  try {
    let profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      if (uploadResult.success && uploadResult.data?.secure_url) {
        profileImageUrl = uploadResult.data.secure_url;
      }
    }
    if (!email || !password || !name || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUser.password = hashedPassword;
        existingUser.verificationTokenExpiry = new Date(Date.now() + 3600000);
        existingUser.verificationToken = verifyCode;
        existingUser.profileImage = profileImageUrl;
        await prisma.user.update({
          where: { email },
          data: existingUser,
        });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const tokenExpiry = new Date(Date.now() + 3600000);

      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          address,
          role,
          profileImage: profileImageUrl,
          verificationToken: verifyCode,
          verificationTokenExpiry: tokenExpiry,
        },
      });
    }
    const emailResponse = await sendEmailVerification(email, name, verifyCode);
    if (!emailResponse) {
        return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }
    console.log("Email sent response:", emailResponse);
    res
      .status(201)
      .json({
        message: "Otp Sended Successfully.",
      });
  } catch (error) {
    console.error("Error during user creation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const verifyToken = async (req: Request, res: Response) => {
  const { email, verificationToken } : User= req.body;
  if (typeof email !== "string" || typeof verificationToken !== "string") {
    return { valid: false, message: "Invalid input" };
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } }) as User;
    if (!user) {
      return { valid: false, message: "User not found" };
    }
    if (user.isEmailVerified) {
      return { valid: false, message: "Email is already verified" };
    }
    if (user.verificationToken !== verificationToken) {
      return { valid: false, message: "Invalid verification token" };
    }
    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {
      return { valid: false, message: "Verification token has expired" };
    }
    await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });
    const token : string = generateToken(user.id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 24 * 60 * 60 * 1000 
    });
    res
    return { valid: true, message: "Email verified successfully", token };
  } catch (error) {
    console.error("Error during token verification:", error);
    return { valid: false, message: "Internal server error" };
  }
};
