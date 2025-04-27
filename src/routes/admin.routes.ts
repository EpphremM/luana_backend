import { Router } from "express";
import { signup, getAdmin, getOne, update, deleteAdmin } from "../controller/admin.controller";
import { requireRole } from "../utils/role.middleware";
import { UserRole } from "../database/anum/role.enum";

export class AdminRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    
    this.router.route("/").post(signup);
    this.router.route("/").get(getAdmin);
    this.router.route("/:id").get(getOne).patch(requireRole([UserRole.Company,UserRole.Admin,UserRole.Casher]),update).delete(requireRole(UserRole.Company),deleteAdmin);
}
}