import "reflect-metadata";
import { DataSource } from "typeorm";
import ENV from "../config/env";
import { createDefaultCompany } from "../controller/company.controller";

export const AppDataSource: DataSource = new DataSource({
  type: "postgres",
  host: ENV.db_host,
  username: ENV.db_username,
  port: parseInt(ENV.db_port || "5432"),
  database: ENV.db_name,
  password: ENV.db_password,
  entities: [__dirname + '/entities/*.entity.{ts,js}',__dirname+"/../payment/entities/**/*.ts"],
  migrations: [__dirname + "/migration/**/*.ts"],
  synchronize: true,
  // ssl: { rejectUnauthorized: false }
});



const intializeConnection =() => {
  try { 
    AppDataSource.initialize().then(async() => {
      console.log("Database connected");
      await createDefaultCompany();
    });
  } catch (error) {
    console.log("database connectionn error ", error);
  }
};
export default intializeConnection;
