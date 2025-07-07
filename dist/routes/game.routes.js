"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoutes = void 0;
const express_1 = require("express");
const game_controller_1 = require("../controller/game.controller");
class GameRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setRoutes();
    }
    setRoutes() {
        this.router.route("/").post(game_controller_1.createGame);
        this.router.route("/").get(game_controller_1.getAllGames);
        this.router.route("/admin-sales").get(game_controller_1.getFilteredAdminSales);
        this.router.route("/super-agent-sales").get(game_controller_1.getSuperAgentSalesReport);
        this.router.route("/:id").get(game_controller_1.getOneGame).patch(game_controller_1.updateGame).delete(game_controller_1.deleteGame);
        this.router.route("/bycasher/:id").get(game_controller_1.getGamesByCasherId);
        this.router.route("/game-update/:id").post(game_controller_1.updateWinGame);
    }
}
exports.GameRoutes = GameRoutes;
