import express, { Application } from "express";
import { UserRoutes } from "./routes/user.routes";
import bodyParser from "body-parser";
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
        this.app.use("/bingo/v1/user",userRoutes.router)
    }
}

export default new App().app;