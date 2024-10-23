import { Request } from "express";

export interface IReqUser extends Request {
  users: {
    id: string;
    roles: string[];
    isVerify: boolean;
  };
}
