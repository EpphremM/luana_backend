import intializeConnection from "./database/data.source";
import express, {Application} from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv"
import "reflect-metadata";
import app from "./app"
import cors from 'cors'
dotenv.config();

const port=process.env.PORT||3000;
intializeConnection();

app.listen(port,()=>{
    console.log(`server is running at port ${port}`);
})           