import { Router } from "express";
import { companyEarnings, deleteCompany, getCompanies, getOneCompany, signup, updateCompany } from "../controller/company.controller";
import { requireRole } from "../utils/role.middleware";
import { UserRole } from "../database/enum/role.enum";


export class CompanyRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(signup).get(getCompanies);
    this.router.route("/earnings/:id").get(companyEarnings);
    this.router.route("/:id").get(getOneCompany).patch(updateCompany).delete(requireRole(UserRole.Company),deleteCompany);
}
}