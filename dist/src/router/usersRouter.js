"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usersController_1 = require("../controllers/usersController");
const middlewares_1 = require("../middlewares");
const users_1 = require("../db/users");
exports.default = (router) => {
    router.get("/users", middlewares_1.isAuthenticated, usersController_1.getAllUsers);
    router.get('/users/me', middlewares_1.isAuthenticated, usersController_1.getMe);
    router.delete("/users/:id", middlewares_1.isAuthenticated, (0, middlewares_1.isOwner)(users_1.getUserById), usersController_1.deleteUser);
    router.patch("/users/:id", middlewares_1.isAuthenticated, (0, middlewares_1.isOwner)(users_1.getUserById), usersController_1.updateUser);
};
//# sourceMappingURL=usersRouter.js.map