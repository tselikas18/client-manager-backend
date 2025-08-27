import * as crypto from "crypto";
import {config} from "../../config";
import {Request} from "express";

const SECRET_KEY = config.API_KEY;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const getCurrentUserId = (req: Request): string | null =>
    (req as any).identity?._id ?? null;
export const random = () => crypto.randomBytes(128).toString("base64");
export const authentication = (salt: string, password: string) => {
  return crypto.createHmac('sha256', [salt, password].join('/')).update(SECRET_KEY).digest('hex');
}