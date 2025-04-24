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
    
    this.router.route("/").post(requireRole(UserRole.Company), signup);
    this.router.route("/").get(requireRole([UserRole.Company]),getAdmin);
    this.router.route("/:id").get(requireRole([UserRole.Company,UserRole.Casher,UserRole.Admin]),getOne).patch(requireRole([UserRole.Company,UserRole.Admin,UserRole.Casher]),update).delete(requireRole(UserRole.Company),deleteAdmin);
}
}