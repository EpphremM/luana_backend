import { Router } from "express";
import { deleteCasher, getCashers, getOneCasher, signup, updateCasher } from "../controller/casher.controller";



export class CasherRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(signup);
    this.router.route("/").get(getCashers);
    this.router.route("/:id").get(getOneCasher).patch(updateCasher).delete(deleteCasher);
}
}