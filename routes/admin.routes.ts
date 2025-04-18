import { Router } from "express";
import { adminSignup, getAdmin } from "../controller/admin.controller";

export class AdminRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(adminSignup);
    this.router.route("/").get(getAdmin);
}
}