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
    this.router.route("/").post(signup);
    this.router.route("/").get(getCashers);
    this.router.route("/:id").get(getOneCasher).patch(requireRole([UserRole.Admin,UserRole.Casher,UserRole.Company]),updateCasher).delete(requireRole([UserRole.Admin,UserRole.Casher,UserRole.Company]),deleteCasher);
}
}