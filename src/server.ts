import initializeConnection from "./database/data.source";
import dotenv from "dotenv";
import "reflect-metadata";
import app from "./app";
import https from "https";
import fs from "fs";
import path from "path";
import express from "express";

dotenv.config();

const port = process.env.PORT || 3000;

console.log("DB Host:", process.env.DB_HOST);
const buildPath = "/home/ephrem/ephis_stuff/Biongo/Luana/go_offline/offline/build";

// Initialize DB
initializeConnection();

// Load self-signed certificate
const sslOptions = {
  key: fs.readFileSync("ssl/key.pem"),
  cert: fs.readFileSync("ssl/cert.pem"),
};

app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start HTTPS server
https.createServer(sslOptions, app).listen(port, () => {
  console.log(`✅ HTTPS server running at https://localhost:${port}`);
});

// app.listen(3000,()=>{
// console.log("Server is running...");
// })