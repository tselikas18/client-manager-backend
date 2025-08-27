import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({path: ".env"});

const ENVSchema = z.object({
  MONGODB_URL: z.string().url(),
  API_KEY: z.string().min(32),
  JWT_SECRET: z.string().min(32),
  PORT: z.string().regex(/^\d+$/),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url(),
});

export const config = ENVSchema.parse(process.env);