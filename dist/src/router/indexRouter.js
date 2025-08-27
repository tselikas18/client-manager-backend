"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticationRouter_1 = __importDefault(require("./authenticationRouter"));
const usersRouter_1 = __importDefault(require("./usersRouter"));
const supplierRouter_1 = __importDefault(require("./supplierRouter"));
const clientRouter_1 = __importDefault(require("./clientRouter"));
const dashboardRouter_1 = __importDefault(require("./dashboardRouter"));
const router = express_1.default.Router();
exports.default = () => {
    (0, authenticationRouter_1.default)(router);
    (0, usersRouter_1.default)(router);
    (0, clientRouter_1.default)(router);
    (0, supplierRouter_1.default)(router);
    (0, dashboardRouter_1.default)(router); // Add the dashboard router
    return router;
};
//# sourceMappingURL=indexRouter.js.map