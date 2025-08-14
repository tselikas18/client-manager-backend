import { isAuthenticated, isOwner } from "../middlewares";
import express from "express";
import {
  deleteClient,
  getAllClients,
  updateClient,
  createClient,
  getClientByPhoneController,
  getClientByNameController,
  getClientByEmailController,
  deleteClientByPhoneController,
  deleteClientByEmailController,
  deleteClientByNameController,
} from "../controllers/clientControllers";
import {getClientById} from "../db/client";

export default (router: express.Router) => {
  router.get("/client", isAuthenticated, getAllClients);
  router.post("/client/", isAuthenticated, createClient);

  router.get("/client/phone/:phone", isAuthenticated, getClientByPhoneController);
  router.get("/client/name/:name", isAuthenticated, getClientByNameController);
  router.get("/client/email/:email", isAuthenticated, getClientByEmailController);

  router.delete("/client/phone/:phone", isAuthenticated, deleteClientByPhoneController);
  router.delete("/client/email/:email", isAuthenticated, deleteClientByEmailController);
  router.delete("/client/name/:name", isAuthenticated, deleteClientByNameController);

  router.delete("/client/:id", isAuthenticated, isOwner(getClientById), deleteClient);
  router.patch("/client/:id", isAuthenticated, isOwner(getClientById), updateClient);

};