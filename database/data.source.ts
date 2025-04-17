import "reflect-metadata";
import { DataSource } from "typeorm";
import ENV from "../config/env";

export const AppDataSource: DataSource = new DataSource({
  type: "postgres",
  host: ENV.db_host,
  username: ENV.db_username,
  port: parseInt(ENV.db_port || "5432"),
  database: ENV.db_name,
  password: ENV.db_password,
  entities: [__dirname + "/entities/**/*.ts",__dirname+"/../payment/entities/**/*.ts"],
  migrations: [__dirname + "/migration/**/*.ts"],
  synchronize: true,
  // ssl: { rejectUnauthorized: true }
});



const intializeConnection = () => {
  try { 
    AppDataSource.initialize().then(() => {
      console.log("Database connected");
    });
  } catch (error) {
    console.log("database connection error ", error);
  }
};
export default intializeConnection;
