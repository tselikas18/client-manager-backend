import {isAuthenticated, isOwner} from "../middlewares";
import express from "express";
import {
  deleteSupplier,
  getAllSuppliers,
  updateSupplier,
  createSupplier,
  getSupplierByPhoneController,
  getSupplierByNameController,
  getSupplierByEmailController,
  deleteSupplierByPhoneController,
  deleteSupplierByEmailController,
  deleteSupplierByNameController
} from "../controllers/supplierController";
import {getSupplierById} from "../db/supplier";

export default (router: express.Router) => {
  router.get("/suppliers", isAuthenticated, getAllSuppliers);
  router.post("/suppliers/", isAuthenticated, createSupplier);

  router.get("/suppliers/phone/:phone", isAuthenticated, getSupplierByPhoneController);
  router.get("/suppliers/name/:name", isAuthenticated, getSupplierByNameController);
  router.get("/suppliers/email/:email", isAuthenticated, getSupplierByEmailController);

  router.delete("/suppliers/phone/:phone", isAuthenticated, deleteSupplierByPhoneController);
  router.delete("/suppliers/email/:email", isAuthenticated, deleteSupplierByEmailController);
  router.delete("/suppliers/name/:name", isAuthenticated, deleteSupplierByNameController);

  router.delete("/suppliers/:id", isAuthenticated, isOwner(getSupplierById), deleteSupplier);
  router.patch("/suppliers/:id", isAuthenticated, isOwner(getSupplierById), updateSupplier);
  router.put("/suppliers/:id", isAuthenticated, isOwner(getSupplierById), updateSupplier);
};