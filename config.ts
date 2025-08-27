import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({path: ".env"});

const ENVSchema = z.object({
  MONGODB_URL: z.string(),
  API_KEY: z.string(),
  JWT_SECRET: z.string(),
  PORT: z.string(),
});

export const config = ENVSchema.parse(process.env);