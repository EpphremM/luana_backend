import intializeConnection from "./database/data.source";
import express, {Application} from "express";
import dotenv from "dotenv"
import "reflect-metadata";

dotenv.config();
const app:Application=express();
const port=process.env.PORT||3000;
intializeConnection();
app.listen(port,()=>{
    console.log(`server is running at port ${port}`);
})