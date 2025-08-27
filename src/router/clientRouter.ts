import { isAuthenticated, isOwner } from "../middlewares";
import express from "express";
import {
  deleteClient,
  getAllClients,
  updateClient,
  createClient,
} from "../controllers/clientControllers";
import {getClientById} from "../db/client";

export default (router: express.Router) => {
  router.get("/clients", isAuthenticated, getAllClients);
  router.post("/clients/", isAuthenticated, createClient);
  router.delete("/clients/:id", isAuthenticated, isOwner(getClientById), deleteClient);
  router.patch("/clients/:id", isAuthenticated, isOwner(getClientById), updateClient);
  router.put("/clients/:id", isAuthenticated, isOwner(getClientById), updateClient);
};