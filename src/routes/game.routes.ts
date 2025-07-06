import { Router } from "express";
import { createGame, deleteGame, getAllGames, getFilteredAdminSales, getGamesByCasherId, getOneGame, getSuperAgentSalesReport, updateGame, updateWinGame } from "../controller/game.controller";



export class GameRoutes{
public router:Router;
constructor(){
    this.router=Router();
    this.setRoutes();
}
private setRoutes(){
    this.router.route("/").post(createGame);
    this.router.route("/").get(getAllGames);
    this.router.route("/admin-sales").get(getFilteredAdminSales);
    this.router.route("/super-agent-sales").get(getSuperAgentSalesReport);
    this.router.route("/:id").get(getOneGame).patch(updateGame).delete(deleteGame);
    this.router.route("/bycasher/:id").get(getGamesByCasherId);
    this.router.route("/game-update/:id").post(updateWinGame);
}
}