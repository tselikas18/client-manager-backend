import { Request, Response, NextFunction, } from 'express';
import express from "express";
import { getUserById } from "../db/users";
import jwt from "jsonwebtoken";
import { config } from "../../config";

//Ownership middleware
export const isOwner = (getById: (id: string) => Promise<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = (req as any).identity?._id as string | undefined;
      console.debug('isOwner: currentUserId=', currentUserId);
      if (!currentUserId) return res.sendStatus(401);

      const { id } = req.params;
      console.debug('isOwner: req.params.id=', id, 'method=', req.method);
      if (!id || req.method === 'POST') return next();

      const resource = await getById(id);
      console.debug('isOwner: resource=', resource);
      if (!resource) return res.status(404).json({ message: 'resource not found' });

      const resourceOwnerId = resource.user_id ?? resource.userId ?? resource._id;
      console.debug('isOwner: resourceOwnerId=', resourceOwnerId);
      if (!resourceOwnerId || resourceOwnerId.toString() !== currentUserId.toString()) {
        return res.status(403).json({ message: 'forbidden action' });
      }

      return next();
    } catch (err) {
      console.error(err);
      return res.sendStatus(400);
    }
  };
};

// src/middlewares/index.ts
export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.sendStatus(401);

    const token = authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    const existingUser = await getUserById(decoded.userId);

    if (!existingUser) return res.sendStatus(401);

    (req as any).identity = existingUser;
    return next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(401);
  }
}