"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardRoutes = void 0;
const express_1 = require("express");
const card_controller_1 = require("../controller/card.controller");
class CardRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setRoutes();
    }
    setRoutes() {
        this.router.route("/").post(card_controller_1.register).get(card_controller_1.getALlCards);
        this.router.route("/:id").get(card_controller_1.getOne).delete(card_controller_1.deleteCard).patch(card_controller_1.update);
    }
}
exports.CardRoutes = CardRoutes;
