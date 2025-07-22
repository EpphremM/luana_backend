"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const env_1 = __importDefault(require("../config/env"));
const company_controller_1 = require("../controller/company.controller");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    // url:ENV.database_url,
    host: env_1.default.db_host,
    username: env_1.default.db_username,
    port: parseInt(env_1.default.db_port || "5432"),
    database: env_1.default.db_name,
    password: env_1.default.db_password,
    entities: [__dirname + '/entities/*.entity.{ts,js}', __dirname + "/../payment/entities/**/*.ts"],
    migrations: [__dirname + "/migration/**/*.ts"],
    synchronize: true,
    poolSize: 10,
    extra: {
        max: 10,
        idleTimeoutMillis: 30000,
    }
    // ssl: {
    //   rejectUnauthorized: false 
    // }
});
const intializeConnection = () => {
    try {
        exports.AppDataSource.initialize().then(async () => {
            console.log("Database connected");
            await (0, company_controller_1.createDefaultCompany)();
        });
    }
    catch (error) {
        console.log("database connectionn error ", error);
    }
};
exports.default = intializeConnection;
