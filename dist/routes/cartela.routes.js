"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartelaRoutes = void 0;
const express_1 = require("express");
const cartela_controller_1 = require("../controller/cartela.controller");
class CartelaRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setRoutes();
    }
    setRoutes() {
        this.router.route("/").post(cartela_controller_1.register).get(cartela_controller_1.getAllCartela);
        this.router.route("/copy-cartela/").post(cartela_controller_1.copyCartela);
        this.router.route("/:id").get(cartela_controller_1.getOne).delete(cartela_controller_1.deleteCartela).patch(cartela_controller_1.update);
    }
}
exports.CartelaRoutes = CartelaRoutes;
