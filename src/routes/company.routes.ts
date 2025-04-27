import { Router } from "express";
import { deleteCompany, getCompanies, getOneCompany, signup, updateCompany } from "../controller/company.controller";
import { requireRole } from "../utils/role.middleware";
import { UserRole } from "../database/anum/role.enum";


export class CompanyRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(signup);
    this.router.route("/").get(getCompanies);
    this.router.route("/:id").get(getOneCompany).patch(requireRole(UserRole.Company),updateCompany).delete(requireRole(UserRole.Company),deleteCompany);
}
}