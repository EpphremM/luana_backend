"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = require("express");
const admin_controller_1 = require("../controller/admin.controller");
const role_middleware_1 = require("../utils/role.middleware");
const role_enum_1 = require("../database/enum/role.enum");
class AdminRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setRoutes();
    }
    setRoutes() {
        this.router.route("/").post(admin_controller_1.signup);
        this.router.route("/").get(admin_controller_1.getAdmin);
        this.router.route("/earnings/:id").get(admin_controller_1.AdminEarnings);
        this.router.route("/report/last15days").get(admin_controller_1.admin15DayReport);
        this.router.route("/:id").get(admin_controller_1.getOne).patch(admin_controller_1.update).delete((0, role_middleware_1.requireRole)(role_enum_1.UserRole.Company), admin_controller_1.deleteAdmin);
    }
}
exports.AdminRoutes = AdminRoutes;
