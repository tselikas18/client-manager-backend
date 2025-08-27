"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env" });
const ENVSchema = zod_1.z.object({
    MONGODB_URL: zod_1.z.string(),
    API_KEY: zod_1.z.string(),
    PORT: zod_1.z.string(),
});
exports.config = ENVSchema.parse(process.env);
//# sourceMappingURL=config.js.map