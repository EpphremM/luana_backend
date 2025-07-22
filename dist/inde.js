"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.killOtherConnections = killOtherConnections;
const data_source_1 = require("./database/data.source");
async function killOtherConnections() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
        }
        const dbName = data_source_1.AppDataSource.options.database;
        await data_source_1.AppDataSource.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid();
    `, [dbName]);
        console.log("Other connections terminated successfully.");
    }
    catch (error) {
        console.error("Failed to terminate connections:", error);
    }
}
