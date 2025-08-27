"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const middlewares_1 = require("../middlewares");
const clientControllers_1 = require("../controllers/clientControllers");
const client_1 = require("../db/client");
exports.default = (router) => {
    router.get("/clients", middlewares_1.isAuthenticated, clientControllers_1.getAllClients);
    router.post("/clients/", middlewares_1.isAuthenticated, clientControllers_1.createClient);
    router.get("/clients/phone/:phone", middlewares_1.isAuthenticated, clientControllers_1.getClientByPhoneController);
    router.get("/clients/name/:name", middlewares_1.isAuthenticated, clientControllers_1.getClientByNameController);
    router.get("/clients/email/:email", middlewares_1.isAuthenticated, clientControllers_1.getClientByEmailController);
    router.delete("/clients/phone/:phone", middlewares_1.isAuthenticated, clientControllers_1.deleteClientByPhoneController);
    router.delete("/clients/email/:email", middlewares_1.isAuthenticated, clientControllers_1.deleteClientByEmailController);
    router.delete("/clients/name/:name", middlewares_1.isAuthenticated, clientControllers_1.deleteClientByNameController);
    router.delete("/clients/:id", middlewares_1.isAuthenticated, (0, middlewares_1.isOwner)(client_1.getClientById), clientControllers_1.deleteClient);
    router.patch("/clients/:id", middlewares_1.isAuthenticated, (0, middlewares_1.isOwner)(client_1.getClientById), clientControllers_1.updateClient);
    router.put("/clients/:id", middlewares_1.isAuthenticated, (0, middlewares_1.isOwner)(client_1.getClientById), clientControllers_1.updateClient);
};
//# sourceMappingURL=clientRouter.js.map