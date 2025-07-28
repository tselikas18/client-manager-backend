import * as crypto from "crypto";
import {config} from "../../config";

const SECRET_KEY = config.API_KEY;

export const random = () => crypto.randomBytes(128).toString("base64");
export const authentication = (salt: string, password: string) => {
  return crypto.createHmac('sha256', [salt, password].join('/')).update(SECRET_KEY).digest('hex');
}