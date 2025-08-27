"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const indexRouter_1 = __importDefault(require("./router/indexRouter"));
const app = (0, express_1.default)();
const databaseURL = config_1.config.MONGODB_URL;
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
const server = http_1.default.createServer(app);
server.listen(8000, () => { console.log('Server is running on port http://localhost:8000/'); });
console.log(`db is running at ${databaseURL}`);
mongoose_1.default.Promise = Promise;
mongoose_1.default.connect(databaseURL);
mongoose_1.default.connection.on('error', (error) => console.log(error));
app.use('/', (0, indexRouter_1.default)());
//# sourceMappingURL=index.js.map