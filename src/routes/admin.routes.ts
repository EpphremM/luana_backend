import { Router } from "express";
import { signup, getAdmin, getOne, update, deleteAdmin, AdminEarnings, getAdminsBySuperAgent, superAdminAdmin15DayReport, companyAdmin15DayReport, getAllAdmins, getAdminUserName } from "../controller/admin.controller";
import { requireRole } from "../utils/role.middleware";
import { UserRole } from "../database/enum/role.enum";

export class AdminRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    
    this.router.route("/").post(signup);
    this.router.route("/").get(getAdmin);
    this.router.route("/all-admins").get(getAllAdmins);
    this.router.route("/earnings/:id").get(AdminEarnings);
    this.router.route("/username/:id").get(getAdminUserName);
    this.router.route("/report/last15days/super/:super_id").get(superAdminAdmin15DayReport)
    this.router.route("/report/last15days").get(companyAdmin15DayReport)
    this.router.route("/bysuperagent/:superAgentId").get(getAdminsBySuperAgent);
    this.router.route("/:id").get(getOne).patch(update).delete(requireRole(UserRole.Company),deleteAdmin);
}
}