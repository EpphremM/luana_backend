"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = __importDefault(require("./database/data.source"));
const dotenv_1 = __importDefault(require("dotenv"));
require("reflect-metadata");
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
const port = process.env.PORT;
console.log("Port is port", process.env.DB_HOST);
(0, data_source_1.default)();
app_1.default.listen(port, async () => {
    console.log(`server is running at port ${port}`);
});
