"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controller/auth.controller");
class AuthRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setRoutes();
    }
    setRoutes() {
        this.router.route("/login").post(auth_controller_1.login);
        this.router.route("/ping").get(auth_controller_1.ping);
        this.router.route("/refresh").get(auth_controller_1.refresh);
        this.router.route("/logout").post(auth_controller_1.logout);
        this.router.route("/validate-session").get(auth_controller_1.validateSession);
    }
}
exports.AuthRoutes = AuthRoutes;
