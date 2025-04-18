import express, { Application } from "express";
import { UserRoutes } from "./routes/user.routes";
import bodyParser from "body-parser";
import { AdminRoutes } from "./routes/admin.routes";
import { globalErrorHandler } from "./global/global.erro.handler";
import { CompanyRoutes } from "./routes/company.routes";
import { CasherRoutes } from "./routes/casher.routes";
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
        const companyRoutes=new CompanyRoutes();
        const casherRoutes=new CasherRoutes();
        this.app.use("/bingo/v1/user",userRoutes.router)
        this.app.use("/bingo/v1/admin",adminRutes.router)
        this.app.use("/bingo/v1/company",companyRoutes.router)
        this.app.use("/bingo/v1/casher",casherRoutes.router)
        this.app.use(globalErrorHandler);
    }
}

export default new App().app;