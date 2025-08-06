import express from "express";
import { get, merge } from "lodash";
import {getUserBySessionToken} from "../db/users";


export const isOwner = async  (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const currentUserId = get(req, 'identity._id') as unknown as string;

    if (!currentUserId) {
      return res.status(403);
    }

    if (currentUserId.toString() !== id) {
      return res.status(403).json({message: "forbidden action"});
    }
  next();
  }catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
}

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const sessionToken = req.cookies['authenticated'];

    if (!sessionToken) {
      return res.status(403).json({error: "No token provided"});
    }

    const existingUser = await getUserBySessionToken(sessionToken);
    if (!existingUser) {
      return res.status(403).json({error: "No token provided"});
    }

    merge(req, {identity: existingUser});

    return next();
  } catch (error){
    console.log(error)
    return res.sendStatus(400);
  }
}
