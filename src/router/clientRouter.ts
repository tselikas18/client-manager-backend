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
  router.get("/clients", isAuthenticated, getAllClients);
  router.post("/clients/", isAuthenticated, createClient);

  router.get("/clients/phone/:phone", isAuthenticated, getClientByPhoneController);
  router.get("/clients/name/:name", isAuthenticated, getClientByNameController);
  router.get("/clients/email/:email", isAuthenticated, getClientByEmailController);

  router.delete("/clients/phone/:phone", isAuthenticated, deleteClientByPhoneController);
  router.delete("/clients/email/:email", isAuthenticated, deleteClientByEmailController);
  router.delete("/clients/name/:name", isAuthenticated, deleteClientByNameController);

  router.delete("/clients/:id", isAuthenticated, isOwner(getClientById), deleteClient);
  router.patch("/clients/:id", isAuthenticated, isOwner(getClientById), updateClient);
  router.put("/clients/:id", isAuthenticated, isOwner(getClientById), updateClient);
};