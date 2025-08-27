import {isAuthenticated, isOwner} from "../middlewares";
import express from "express";
import {
  deleteSupplier,
  getAllSuppliers,
  updateSupplier,
  createSupplier,
} from "../controllers/supplierController";
import {getSupplierById} from "../db/supplier";

export default (router: express.Router) => {
  router.get("/suppliers", isAuthenticated, getAllSuppliers);
  router.post("/suppliers/", isAuthenticated, createSupplier);
  router.delete("/suppliers/:id", isAuthenticated, isOwner(getSupplierById), deleteSupplier);
  router.patch("/suppliers/:id", isAuthenticated, isOwner(getSupplierById), updateSupplier);
  router.put("/suppliers/:id", isAuthenticated, isOwner(getSupplierById), updateSupplier);
};