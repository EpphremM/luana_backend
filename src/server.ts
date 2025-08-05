import initializeConnection from "./database/data.source";
import dotenv from "dotenv";
import "reflect-metadata";
import app from "./app";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import express from "express";

dotenv.config();

const port = process.env.PORT;
const buildPath = path.join(__dirname, "../build");

console.log("DB Host:", process.env.DB_HOST);

// Initialize DB connection
initializeConnection();

// Serve frontend build folder
app.use(express.static(buildPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const keyPath = path.join(__dirname, "ssl", "key.pem");
const certPath = path.join(__dirname, "ssl", "cert.em");

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  https.createServer(sslOptions, app).listen(port, () => {
    console.log(`✅ HTTPS server running at https://localhost:${port}`);
  });
} else {
  console.warn("⚠️ SSL files not found. Falling back to HTTP.");
  http.createServer(app).listen(port, () => {
    console.log(`🟡 HTTP server running at http://localhost:${port}`);
  });
}



// app.listen(3000,()=>{
// console.log("Server is running...");
// })