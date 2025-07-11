"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasherRoutes = void 0;
const express_1 = require("express");
const casher_controller_1 = require("../controller/casher.controller");
const role_middleware_1 = require("../utils/role.middleware");
const role_enum_1 = require("../database/enum/role.enum");
class CasherRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setRoutes();
    }
    setRoutes() {
        this.router.route("/").post(casher_controller_1.signup);
        this.router.route("/").get(casher_controller_1.getCashers);
        this.router.route("/balance/:id").get(casher_controller_1.findBalance).patch(casher_controller_1.updateBalance);
        this.router.route("/earnings/:id").get(casher_controller_1.cashierEarnings);
        this.router.route("/weekly/:id").get(casher_controller_1.weeklyEarnings);
        this.router.route("/report/:id").get(casher_controller_1.weeklyReport);
        this.router.route("/:id").get(casher_controller_1.getOneCasher).patch((0, role_middleware_1.requireRole)([role_enum_1.UserRole.Admin, role_enum_1.UserRole.Casher, role_enum_1.UserRole.Company]), casher_controller_1.updateCasher).delete((0, role_middleware_1.requireRole)([role_enum_1.UserRole.Admin, role_enum_1.UserRole.Casher, role_enum_1.UserRole.Company]), casher_controller_1.deleteCasher);
    }
}
exports.CasherRoutes = CasherRoutes;
