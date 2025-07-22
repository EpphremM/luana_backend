"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRoutes = void 0;
const express_1 = require("express");
const company_controller_1 = require("../controller/company.controller");
const role_middleware_1 = require("../utils/role.middleware");
const role_enum_1 = require("../database/enum/role.enum");
class CompanyRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setRoutes();
    }
    setRoutes() {
        this.router.route("/").post(company_controller_1.signup).get(company_controller_1.getCompanies);
        this.router.route("/admin-status").get(company_controller_1.getAllAdminActivityStatus);
        this.router.route("/earnings/:id").get(company_controller_1.companyEarnings);
        this.router.route("/username/:id").get(company_controller_1.getCompanyUserName);
        this.router.route("/:id").get(company_controller_1.getOneCompany).patch(company_controller_1.updateCompany).delete((0, role_middleware_1.requireRole)(role_enum_1.UserRole.Company), company_controller_1.deleteCompany);
        this.router.route("/super-agent/topup/:id").post(company_controller_1.topUpForSuperAgents);
        this.router.route("/admin/topup/:id").post(company_controller_1.topUpForAdmins);
    }
}
exports.CompanyRoutes = CompanyRoutes;
