import { Router } from "express";
import { deleteCartela, getAllCartela, getOne, register, update } from "../controller/cartela.controller";





export class CartelaRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(register).get(getAllCartela);
    this.router.route("/:id").get(getOne).delete(deleteCartela).patch(update);
}
}