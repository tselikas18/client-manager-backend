"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const middlewares_1 = require("../middlewares");
const supplierController_1 = require("../controllers/supplierController");
const supplier_1 = require("../db/supplier");
exports.default = (router) => {
    router.get("/suppliers", middlewares_1.isAuthenticated, supplierController_1.getAllSuppliers);
    router.post("/suppliers/", middlewares_1.isAuthenticated, supplierController_1.createSupplier);
    router.get("/suppliers/phone/:phone", middlewares_1.isAuthenticated, supplierController_1.getSupplierByPhoneController);
    router.get("/suppliers/name/:name", middlewares_1.isAuthenticated, supplierController_1.getSupplierByNameController);
    router.get("/suppliers/email/:email", middlewares_1.isAuthenticated, supplierController_1.getSupplierByEmailController);
    router.delete("/suppliers/phone/:phone", middlewares_1.isAuthenticated, supplierController_1.deleteSupplierByPhoneController);
    router.delete("/suppliers/email/:email", middlewares_1.isAuthenticated, supplierController_1.deleteSupplierByEmailController);
    router.delete("/suppliers/name/:name", middlewares_1.isAuthenticated, supplierController_1.deleteSupplierByNameController);
    router.delete("/suppliers/:id", middlewares_1.isAuthenticated, (0, middlewares_1.isOwner)(supplier_1.getSupplierById), supplierController_1.deleteSupplier);
    router.patch("/suppliers/:id", middlewares_1.isAuthenticated, (0, middlewares_1.isOwner)(supplier_1.getSupplierById), supplierController_1.updateSupplier);
    router.put("/suppliers/:id", middlewares_1.isAuthenticated, (0, middlewares_1.isOwner)(supplier_1.getSupplierById), supplierController_1.updateSupplier);
};
//# sourceMappingURL=supplierRouter.js.map