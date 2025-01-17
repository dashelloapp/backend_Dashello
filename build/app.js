"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cors_1 = __importDefault(require("cors"));
const models_1 = require("./models");
const app = (0, express_1.default)();
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
//Do we need whitelist?
app.use((0, cors_1.default)());
app.use("/api/user", userRoutes_1.default);
app.use("/", (req, res, next) => {
    console.log(`
    __________REQUEST INFO__________
    ${new Date().toISOString()}] ${req.ip} ${req.method} ${req.protocol}://${req.hostname}${req.originalUrl}`);
    console.dir(req.body);
    res.status(400).send("app.ts default res");
});
app.use((req, res, next) => {
    res.status(404).end();
});
// Syncing our database
models_1.db.sync().then(() => {
    console.info("connected to the database!");
});
app.listen(3001);
