import { Request, Response } from "express";
import { createUser, getUserByEmail, getUserBySessionToken } from "../db/users";
import { random, authentication } from "../helpers";

const mapToSafeUser = (user: any) => ({
  id: user._id?.toString() ?? user.id,
  name: user.username ?? user.name ?? user.fullName ?? "",
  email: user.email ?? "",
});

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

    const sessionSalt = random();
    if (user.authentication) {
      user.authentication.sessionToken = authentication(sessionSalt, user._id.toString());
    }

    await user.save();

    res.cookie("authenticated", user.authentication?.sessionToken, {
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

export const me = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.authenticated;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const user = await getUserBySessionToken(token);
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    return res.status(200).json(mapToSafeUser(user));
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Internal server error" });
  }
};