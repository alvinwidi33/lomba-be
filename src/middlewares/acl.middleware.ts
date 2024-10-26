import { Request, Response, NextFunction } from "express";
import { IReqUser } from "../utils/interfaces";

export default (roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const userRoles = (req as IReqUser).users.roles;

    if (!userRoles || !userRoles.some((userRole) => roles.includes(userRole))) {
      res.status(403).json({
        message: "Forbidden",
      });
    }

    return next();
  };
