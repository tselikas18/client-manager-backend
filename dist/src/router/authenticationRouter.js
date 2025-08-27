"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authenticationController_1 = require("../controllers/authenticationController");
exports.default = (router) => {
    router.post('/auth/register', authenticationController_1.register);
    router.post('/auth/login', authenticationController_1.login);
    router.get('/auth/me', authenticationController_1.me);
};
//# sourceMappingURL=authenticationRouter.js.map