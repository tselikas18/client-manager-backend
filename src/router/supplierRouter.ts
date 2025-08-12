import express from "express";
import {isAuthenticated, isOwner} from "../middlewares";
import {deleteSupplier, getAllSuppliers, updateSupplier, createSupplier} from "../controllers/supplierController";
import {getSupplierByName, getSupplierByPhone, getSupplierByEmail} from "../db/supplier";

export default (router: express.Router) => {
  router.get("/supplier", isAuthenticated, getAllSuppliers);

  router.get("/supplier/phone/:phone", isAuthenticated, isOwner, getSupplierByPhone);
  router.get("/supplier/name/:name", isAuthenticated, isOwner, getSupplierByName);
  router.get("/supplier/email/:email", isAuthenticated, isOwner, getSupplierByEmail);

  router.delete("/supplier/:id", isAuthenticated, isOwner, deleteSupplier);
  router.patch("/supplier/:id", isAuthenticated, isOwner, updateSupplier);
  router.post("/supplier/", isAuthenticated, isOwner, createSupplier);
};