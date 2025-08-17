import express from "express";
import { deleteUser, getAllUsers, updateUser } from "../controllers/usersController";
import { isAuthenticated, isOwner } from "../middlewares";
import { getUserById } from "../db/users";

export default (router: express.Router) => {
  router.get("/users", isAuthenticated, getAllUsers);
  router.delete("/users/:id", isAuthenticated, isOwner(getUserById), deleteUser);
  router.patch("/users/:id", isAuthenticated, isOwner(getUserById), updateUser);
}