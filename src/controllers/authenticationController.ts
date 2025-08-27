import { Request, Response } from "express";
import { createUser, getUserByEmail, getUserById } from "../db/users";
import { random, authentication } from "../helpers";
import jwt from "jsonwebtoken";
import { config } from "../../config";

const mapToSafeUser = (user: any) => ({
  id: user._id?.toString() ?? user.id,
  name: user.username ?? user.name ?? user.fullName ?? "",
  email: user.email ?? "",
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ error: "Email and password are required" });
    }

    const user = await getUserByEmail(email).select("+authentication.salt +authentication.password");
    if (!user) {
      return res.status(400).send({ error: "User not found" });
    }

    const salt = user.authentication?.salt;
    const expectedHash = salt ? authentication(salt, password) : null;
    if (!expectedHash || user.authentication?.password !== expectedHash) {
      return res.status(403).send({ error: "Passwords do not match" });
    }

    const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email
        },
        config.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie("authenticated", token, {
      httpOnly: true,
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = mapToSafeUser(user);

    return res.status(200).json({
      success: true,
      message: "Authenticated successfully.",
      user: safeUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               username:
 *                 type: string
 *                 example: johndoe
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).send({ error: "Email, username and password are required" });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).send({ error: "Email already in use" });
    }

    const salt = random();
    const created = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    const safeUser = mapToSafeUser(created);
    return res.status(200).json(safeUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export const me = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.authenticated;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    const user = await getUserById(decoded.userId);

    if (!user) return res.status(401).json({ error: "Not authenticated" });

    return res.status(200).json(mapToSafeUser(user));
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Internal server error" });
  }
};