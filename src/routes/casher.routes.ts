import { Router } from "express";
import { cashierEarnings, deleteCasher, getCashers, getOneCasher, signup, updateCasher, weeklyEarnings, weeklyReport } from "../controller/casher.controller";
import { requireRole } from "../utils/role.middleware";
import { UserRole } from "../database/enum/role.enum";



export class CasherRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(signup);
    this.router.route("/").get(getCashers);
    this.router.route("/earnings/:id").get(cashierEarnings);
    this.router.route("/weekly/:id").get(weeklyEarnings);
    this.router.route("/report/:id").get(weeklyReport);
    this.router.route("/:id").get(getOneCasher).patch(requireRole([UserRole.Admin,UserRole.Casher,UserRole.Company]),updateCasher).delete(requireRole([UserRole.Admin,UserRole.Casher,UserRole.Company]),deleteCasher);
}
}