import { Router } from "express";
import { createGame, deleteGame, getAllGames, getOneGame, updateGame } from "../controller/game.controller";



export class GameRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(createGame);
    this.router.route("/").get(getAllGames);
    this.router.route("/:id").get(getOneGame).patch(updateGame).delete(deleteGame);
}
}