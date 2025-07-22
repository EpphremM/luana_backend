import {AppDataSource} from "./database/data.source"

export async function killOtherConnections() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const dbName = AppDataSource.options.database;

    await AppDataSource.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid();
    `, [dbName]);

    console.log("Other connections terminated successfully.");
  } catch (error) {
    console.error("Failed to terminate connections:", error);
  }
}
