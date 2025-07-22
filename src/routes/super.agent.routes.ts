import { Router } from "express";
import {
  signupSuperAgent,
  getSuperAgents,
  getSuperAgentById,
  updateSuperAgent,
  deleteSuperAgent,
  topUpForAdmins,
  superAgentEarningsSummary,
  getAdminActivityStatus,
  getAllSuperAgents,
  getSuperAgentUserName,
} from "../controller/super.agent.controller";
import { requireRole } from "../utils/role.middleware";
import { UserRole } from "../database/enum/role.enum";

export class SuperAgentRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.setRoutes();
  }

  private setRoutes() {
    this.router.route("/").post(signupSuperAgent);
    this.router.route("/").get(getSuperAgents);
    this.router.route("/all-super-agents").get(getAllSuperAgents);
    this.router.route("/:id")
      .get(getSuperAgentById)
      .patch(updateSuperAgent)
      .delete(requireRole(UserRole.Company), deleteSuperAgent);
    
       this.router.route("/earnings/:id").get(superAgentEarningsSummary);
       this.router.route("/username/:id").get(getSuperAgentUserName);
       this.router.route("/admin-status/:id").get(getAdminActivityStatus);
       this.router.route("/topup/:id").post(topUpForAdmins);
  }
}
