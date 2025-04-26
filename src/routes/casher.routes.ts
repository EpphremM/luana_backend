import { Router } from "express";
import { deleteCasher, getCashers, getOneCasher, signup, updateCasher } from "../controller/casher.controller";
import { requireRole } from "../utils/role.middleware";
import { UserRole } from "../database/anum/role.enum";



export class CasherRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(requireRole([UserRole.Admin,UserRole.Company]),signup);
    this.router.route("/").get(requireRole([UserRole.Admin,UserRole.Company]),getCashers);
    this.router.route("/:id").get(getOneCasher).patch(requireRole([UserRole.Admin,UserRole.Casher,UserRole.Company]),updateCasher).delete(requireRole([UserRole.Admin,UserRole.Casher,UserRole.Company]),deleteCasher);
}
}