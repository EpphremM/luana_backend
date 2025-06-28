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
const port = process.env.PORT || 3000;
console.log("DB Host:", process.env.DB_HOST);
const buildPath = "/home/ephrem/ephis_stuff/Biongo/Luana/go_offline/offline/build";
// Initialize DB
(0, data_source_1.default)();
// Load self-signed certificate
// const sslOptions = {
//   key: fs.readFileSync("ssl/key.pem"),
//   cert: fs.readFileSync("ssl/cert.pem"),
// };
// app.use(express.static(buildPath));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(buildPath, 'index.html'));
// });
// Start HTTPS server
// https.createServer(sslOptions, app).listen(port, () => {
//   console.log(`✅ HTTPS server running at https://localhost:${port}`);
// });
app_1.default.listen(3000, () => {
    console.log("Server is running...");
});
