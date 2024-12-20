import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../utils/env";
import { IReqUser } from "../utils/interfaces";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  return new Promise((resolve) => {
    const token = req.headers.authorization;

    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return resolve();
    }

    const [prefix, accessToken] = token.split(" ");

    if (prefix !== "Bearer" || !accessToken) {
      res
        .status(401)
        .json({ message: "Unauthorized: Token format is invalid" });
      return resolve();
    }

    try {
      const user = jwt.verify(accessToken, SECRET) as {
        id: string;
        roles: string[];
        isVerify: boolean;
      };

      if (!user.isVerify) {
        res.status(403).json({ message: "Forbidden: Account is not verified" });
        return resolve();
      }

      (req as IReqUser).users = {
        id: user.id,
        roles: user.roles,
        isVerify: user.isVerify,
      };

      next();
      return resolve();
    } catch (err) {
      if (err instanceof Error) {
        res.status(401).json({
          message: "Unauthorized: Token verification failed",
          error: err.message,
        });
        return resolve();
      }

      res
        .status(401)
        .json({ message: "Unauthorized: An unknown error occurred" });
      return resolve();
    }
  });
};
