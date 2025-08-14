import { Request, Response, NextFunction, } from 'express';
import express from "express";
import {getUserBySessionToken} from "../db/users";

//Ownership middleware
export const isOwner = (getById: (id: string) => Promise<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = (req as any).identity?._id as string | undefined;
      if (!currentUserId) return res.sendStatus(401);

      const { id } = req.params;
      if (!id || req.method === 'POST') return next();

      const resource = await getById(id);
      if (!resource) return res.status(404).json({ message: 'resource not found' });

      if (resource.user_id?.toString() !== currentUserId.toString()) {
        return res.status(403).json({ message: 'forbidden action' });
      }

      return next();
    } catch (err) {
      console.error(err);
      return res.sendStatus(400);
    }
  };
};

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const sessionToken = req.cookies['authenticated'];
    if (!sessionToken) return res.sendStatus(401);

    const existingUser = await getUserBySessionToken(sessionToken);
    if (!existingUser) return res.sendStatus(401);

    (req as any).identity = existingUser;
    console.debug('authenticated user id=', (req as any).identity._id);

    return next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
}
