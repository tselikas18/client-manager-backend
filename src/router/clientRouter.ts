import { isAuthenticated, isOwner } from "../middlewares";
import express from "express";
import {
  deleteClient,
  getAllClients,
  updateClient,
  createClient,
  getClientByPhoneController,
  getClientByNameController,
  getClientByEmailController
} from "../controllers/clientControllers";

export default (router: express.Router) => {
  router.get("/client", isAuthenticated, isOwner, getAllClients);

  router.get("/client/phone/:phone", isAuthenticated, isOwner, getClientByPhoneController);
  router.get("/client/name/:name", isAuthenticated, isOwner, getClientByNameController);
  router.get("/client/email/:email", isAuthenticated, isOwner, getClientByEmailController);

  router.delete("/client/:id", isAuthenticated, isOwner, deleteClient);
  router.patch("/client/:id", isAuthenticated, isOwner, updateClient);
  router.post("/client/", isAuthenticated, createClient);
};