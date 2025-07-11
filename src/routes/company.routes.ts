import { Router } from "express";
import { companyEarnings, deleteCompany, getAllAdminActivityStatus, getCompanies, getOneCompany, signup, topUpForAdmins, topUpForSuperAgents, updateCompany } from "../controller/company.controller";
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
    this.router.route("/admin-status").get(getAllAdminActivityStatus);
    this.router.route("/earnings/:id").get(companyEarnings);
    this.router.route("/:id").get(getOneCompany).patch(updateCompany).delete(requireRole(UserRole.Company),deleteCompany);
    this.router.route("/super-agent/topup/:id").post(topUpForSuperAgents);
    this.router.route("/admin/topup/:id").post(topUpForAdmins);
}
}