import express from "express";
import { isAuthenticated, isOwner } from "../middlewares";
import { deleteClient, getAllClients, updateClient, createClient } from "../controllers/clientControllers";
import { getClientByEmail, getClientByName, getClientByPhone} from "../db/client";

export default (router: express.Router) => {

  router.get("/client", isAuthenticated, getAllClients);


  router.get("/client/phone/:phone", isAuthenticated, isOwner, getClientByPhone);
  router.get("/client/name/:name", isAuthenticated, isOwner, getClientByName);
  router.get("/client/email/:email", isAuthenticated, isOwner, getClientByEmail);


  router.delete("/client/:id", isAuthenticated, isOwner, deleteClient);
  router.patch("/client/:id", isAuthenticated, isOwner, updateClient);
  router.post("/client/", isAuthenticated, isOwner, createClient);
};