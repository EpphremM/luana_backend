"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = __importDefault(require("./database/data.source"));
const dotenv_1 = __importDefault(require("dotenv"));
require("reflect-metadata");
const app_1 = __importDefault(require("./app"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
dotenv_1.default.config();
const port = process.env.PORT;
const buildPath = path_1.default.join(__dirname, "../build");
console.log("DB Host:", process.env.DB_HOST);
// Initialize DB connection
(0, data_source_1.default)();
// Serve frontend build folder
app_1.default.use(express_1.default.static(buildPath));
app_1.default.get("*", (_req, res) => {
    res.sendFile(path_1.default.join(buildPath, "index.html"));
});
const keyPath = path_1.default.join(__dirname, "ssl", "key.pem");
const certPath = path_1.default.join(__dirname, "ssl", "cert.pem");
if (fs_1.default.existsSync(keyPath) && fs_1.default.existsSync(certPath)) {
    const sslOptions = {
        key: fs_1.default.readFileSync(keyPath),
        cert: fs_1.default.readFileSync(certPath),
    };
    https_1.default.createServer(sslOptions, app_1.default).listen(port, () => {
        console.log(`✅ HTTPS server running at https://localhost:${port}`);
    });
}
else {
    console.warn("⚠️ SSL files not found. Falling back to HTTP.");
    http_1.default.createServer(app_1.default).listen(port, () => {
        console.log(`🟡 HTTP server running at http://localhost:${port}`);
    });
}
// app.listen(3000,()=>{
// console.log("Server is running...");
// })
