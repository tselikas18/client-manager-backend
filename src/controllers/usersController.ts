import { Request, Response } from 'express';
import {
  getUsers,
  getUserById,
  deleteUserById,
  updateUserById,
} from '../db/users';

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await getUsers();
    return res.status(200).json(users);
  } catch (err) {
    console.error('getAllUsers error', err);
    return res.sendStatus(500);
  }
};
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
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
/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
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
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const identity = (req as any).identity;
    if (!identity) return res.sendStatus(401);

    const user = identity.toObject ? identity.toObject() : identity;

    delete (user as any).authentication;
    delete (user as any).password;
    delete (user as any).salt;
    delete (user as any).sessionToken;

    return res.status(200).json(user);
  } catch (err) {
    console.error('getMe error', err);
    return res.sendStatus(500);
  }
};