import { Request, Response, NextFunction, } from 'express';
import express from "express";
import { get, merge } from "lodash";
import {getUserBySessionToken} from "../db/users";
import { getClientById } from "../db/client";

export const isOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = get(req, 'identity._id') as string | undefined;
    if (!currentUserId) return res.sendStatus(401);

    const { id } = req.params;

    if (!id || req.method === 'POST') return next();

    const client = await getClientById(id);
    if (!client) return res.status(404).json({ message: 'resource not found' });

    if (client.user_id?.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: 'forbidden action' });
    }

    return next();
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }
};

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
