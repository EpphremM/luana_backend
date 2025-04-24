import { Router } from "express";
import { registraton } from "../controller/user.controller";

export class UserRoutes{
    public router:Router;
    constructor(){
        this.router=Router();
        this.setRoutes();
    }
    private setRoutes(){
        this.router.route('/').post(registraton);
    }
}