import express from 'express';
import {createUser, getUserByEmail} from "../db/users";
import {random, authentication} from "../helpers";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ error: "Email and password are required" });
    }

    const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');

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

    res.cookie('authenticated', user.authentication?.sessionToken, {
      domain: 'localhost',
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Authenticated successfully.'
    }).end();

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const {email, password, username} = req.body;

    if (!email || !password || !username ) {
      return res.sendStatus(400)
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.sendStatus(400);
    }

    const salt= random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    })
    return res.status(200).json(user).end();

  }catch(err) {
    console.log(err);
    return res.sendStatus(400);
  }
}