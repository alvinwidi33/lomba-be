import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UsersModel } from "../models/users.model";
import { SECRET } from "../utils/env";

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).json({ message: "Verification token is missing" });
      return;
    }

    const decoded = jwt.verify(token as string, SECRET) as { id: string };

    const user = await UsersModel.findByIdAndUpdate(
      decoded.id,
      { isVerify: true },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.render("verification-success", {
      name: user.name,
    }) ;
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(400).json({
      message: "Invalid or expired token",
      data: (error as Error).message,
    });
  }
};

