import { Router } from "express";
import { deleteCompany, getCompanies, getOneCompany, signup, updateCompany } from "../controller/company.controller";


export class CompanyRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(signup);
    this.router.route("/").get(getCompanies);
    this.router.route("/:id").get(getOneCompany).patch(updateCompany).delete(deleteCompany);
}
}