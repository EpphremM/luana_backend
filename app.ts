import express, { Application } from "express";
import { UserRoutes } from "./routes/user.routes";
import bodyParser from "body-parser";
import { AdminRoutes } from "./routes/admin.routes";
import { globalErrorHandler } from "./global/global.erro.handler";
class App{
    public app:Application;
    constructor(){

        this.app=express();
        this.app.use(express.json());
        this.intializeRoutes();
        this.intializeMiddleware();
    }
    private intializeMiddleware(){
        this.app.use(bodyParser.json());
        this.app.use(express.json());
    }
    private intializeRoutes(){
        const userRoutes=new UserRoutes();
        const adminRutes=new AdminRoutes();
        this.app.use("/bingo/v1/user",userRoutes.router)
        this.app.use("/bingo/v1/admin",adminRutes.router)
        this.app.use(globalErrorHandler);
    }
}

export default new App().app;