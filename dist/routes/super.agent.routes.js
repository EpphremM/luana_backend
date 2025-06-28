"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAgentRoutes = void 0;
const express_1 = require("express");
const super_agent_controller_1 = require("../controller/super.agent.controller");
const role_middleware_1 = require("../utils/role.middleware");
const role_enum_1 = require("../database/enum/role.enum");
class SuperAgentRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setRoutes();
    }
    setRoutes() {
        this.router.route("/").post(super_agent_controller_1.signupSuperAgent);
        this.router.route("/").get(super_agent_controller_1.getSuperAgents);
        this.router.route("/:id")
            .get(super_agent_controller_1.getSuperAgentById)
            .patch(super_agent_controller_1.updateSuperAgent)
            .delete((0, role_middleware_1.requireRole)(role_enum_1.UserRole.Company), super_agent_controller_1.deleteSuperAgent);
        this.router.route("/topup/:id").post(super_agent_controller_1.topUpForAdmins);
    }
}
exports.SuperAgentRoutes = SuperAgentRoutes;
