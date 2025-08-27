"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const middlewares_1 = require("../middlewares");
const dashboardController_1 = require("../controllers/dashboardController");
exports.default = (router) => {
    router.get('/dashboard', middlewares_1.isAuthenticated, dashboardController_1.getDashboardStats);
};
//# sourceMappingURL=dashboardRouter.js.map