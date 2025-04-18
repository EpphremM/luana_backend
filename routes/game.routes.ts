import { Router } from "express";
import { createGame, deleteGame, getAllGames, getGameById, updateGame } from "../controller/game.controller";



export class CompanyRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(createGame);
    this.router.route("/").get(getAllGames);
    this.router.route("/:id").get(getGameById).patch(updateGame).delete(deleteGame);
}
}