import { Router } from "express";
import { deleteCard, getALlCards, getOne, register, update } from "../controller/card.controller";




export class CardRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(register).get(getALlCards);
    this.router.route("/:id").get(getOne).delete(deleteCard).patch(update);
}
}