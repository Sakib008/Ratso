import prisma from "../../prismaClient.js";
import type { Request } from "express";
const verifyToken = async (req: Request) => {
  const { email, verificationToken } = req.body;
  if (typeof email !== "string" || typeof verificationToken !== "string") {
    return { valid: false, message: "Invalid input" };
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
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
    return { valid: true, message: "Email verified successfully" };
  } catch (error) {
    console.error("Error during token verification:", error);
    return { valid: false, message: "Internal server error" };
  }
};
export default verifyToken;
