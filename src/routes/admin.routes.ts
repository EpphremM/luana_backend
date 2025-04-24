import { Router } from "express";
import { signup, getAdmin, getOne, update, deleteAdmin } from "../controller/admin.controller";

export class AdminRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(signup);
    this.router.route("/").get(getAdmin);
    this.router.route("/:id").get(getOne).patch(update).delete(deleteAdmin);
}
}