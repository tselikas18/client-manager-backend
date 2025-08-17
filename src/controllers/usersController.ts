import { Request, Response } from 'express';
import {
  getUsers,
  getUserById,
  deleteUserById,
  updateUserById,
} from '../db/users';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await getUsers();
    return res.status(200).json(users);
  } catch (err) {
    console.error('getAllUsers error', err);
    return res.sendStatus(500);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.sendStatus(400);

    const existing = await getUserById(id);
    if (!existing) return res.status(404).json({ message: 'user not found' });

    await deleteUserById(id);
    return res.sendStatus(204);
  } catch (err) {
    console.error('deleteUser error', err);
    return res.sendStatus(500);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const values = req.body as Record<string, any>;
    if (!id) return res.sendStatus(400);

    if (values.authentication) {
      delete values.authentication;
    }

    if (values._id) delete values._id;

    const existing = await getUserById(id);
    if (!existing) return res.status(404).json({ message: 'user not found' });

    await updateUserById(id, values);

    const updated = await getUserById(id);
    return res.status(200).json(updated);
  } catch (err) {
    console.error('updateUser error', err);
    return res.sendStatus(500);
  }
};