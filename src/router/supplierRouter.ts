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
  router.post("/supplier/", isAuthenticated, createSupplier);

  router.get("/supplier/phone/:phone", isAuthenticated, getSupplierByPhoneController);
  router.get("/supplier/name/:name", isAuthenticated, getSupplierByNameController);
  router.get("/supplier/email/:email", isAuthenticated, getSupplierByEmailController);

  router.delete("/supplier/phone/:phone", isAuthenticated, deleteSupplierByPhoneController);
  router.delete("/supplier/email/:email", isAuthenticated, deleteSupplierByEmailController);
  router.delete("/supplier/name/:name", isAuthenticated, deleteSupplierByNameController);

  router.delete("/supplier/:id", isAuthenticated, isOwner(getSupplierById), deleteSupplier);
  router.patch("/supplier/:id", isAuthenticated, isOwner(getSupplierById), updateSupplier);
  router.put("/supplier/:id", isAuthenticated, isOwner(getSupplierById), updateSupplier);
};