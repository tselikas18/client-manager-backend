import express from "express";
import {deleteUserById, getUserById, getUsers} from "../db/users";

export const getAllUsers = async (req: express.Request, res: express.Response) => {
  try {
    const users = await getUsers();
    return res.status(200).json(users);
  }catch (error){
    console.log(error);
    return res.status(400);
  }
}

export const deleteUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    const deleteUser = await deleteUserById(id);

    return res.json(deleteUser);
  }catch (error){
    console.log(error);
    return res.status(400);
  }
}

export const updateUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.username = username;
    user.email = email;

    if (!user.authentication) {
      return res.status(400).json({ error: 'Authentication details are missing.' });
    }

    await user.save();
    return res.status(200).json({ message: 'User updated successfully.' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while updating the user.' });
  }
};