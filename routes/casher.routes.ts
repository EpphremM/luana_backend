import { Router } from "express";
import { signup } from "../controller/casher.controller";



export class CasherRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(signup);
    // this.router.route("/").get(getCompanies);
    // this.router.route("/:id").get(getOneCompany).patch(updateCompany).delete(deleteCompany);
}
}