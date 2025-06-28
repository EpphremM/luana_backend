import { Request, Response, NextFunction } from "express";
import { SuperAgentInterface } from "../database/type/super_agent/super.agent.interface";
import { validateInput } from "../zod/middleware/zod.validation";
import { SuperAgentRepository } from "../database/repositories/super.agent.repository";
import { AppError } from "../express/error/app.error";
import { hashPassword } from "../services/hashing.service";
import { UserRepository } from "../database/repositories/user.repository";
import { UserRole } from "../database/enum/role.enum";
import { createResponse } from "../express/types/response.body";
import { PaginationDto } from "../DTO/pagination.dto";
import { superAgentSchema, updateSuperAgentSchema } from "../zod/schemas/super.agent.schema";
import { AdminRepository } from "../database/repositories/admin.repository";

export const signupSuperAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationStatus = await validateInput<SuperAgentInterface>(superAgentSchema, req.body);
console.log(validationStatus.errors);
    if (validationStatus.status !== "success") {
      return next(new AppError("Invalid Request", 400, "Operational"));
    }

    const { super_agent, password, confirm_password, username, first_name, last_name, phone } = req.body;

    if (password !== confirm_password) {
      return next(new AppError("Passwords must match", 400, "Operational"));
    }

    const existingUser = await UserRepository.getRepo().findByUsername(username);
    if (existingUser) {
      return next(new AppError("User already registered", 400, "OperationalError"));
    }

    const hashedPassword = await hashPassword(password);

    const user = await UserRepository.getRepo().register({
      first_name,
      last_name,
      username,
      password: hashedPassword,
      phone,
      role: UserRole.SuperAgent,
    });

    const newSuperAgent = await SuperAgentRepository.getRepo().register({
      ...super_agent,
      user,
    });

    res.status(201).json(createResponse("success", "Super Agent signup completed successfully", newSuperAgent));
  } catch (error) {
    console.error(error);
    next(new AppError("Error occurred. Please try again.", 400, "Operational"));
  }
};

export const getSuperAgents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination: PaginationDto = req.query as unknown as PaginationDto;
    const agents = await SuperAgentRepository.getRepo().find(pagination);
    res.status(200).json(createResponse("success", "Super Agents fetched successfully", agents));
  } catch (error) {
    console.error("Error fetching super agents:", error);
    next(new AppError("Failed to fetch super agents", 500, "Operational"));
  }
};

export const getSuperAgentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const agent = await SuperAgentRepository.getRepo().findById(id);
    if (!agent) {
      return next(new AppError("Super Agent not found", 400, "Operational"));
    }
    res.status(200).json(createResponse("success", "Super Agent fetched successfully", agent));
  } catch (error) {
    next(new AppError("Error fetching super agent", 500, "Operational"));
  }
};

export const updateSuperAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await SuperAgentRepository.getRepo().findById(id);
    if (!existing) {
      return res.status(404).json(createResponse("error", "Super Agent not found", []));
    }

    const { password, confirm_password, first_name, last_name, phone, username, ...agentData } = req.body;

    const agentUpdates = {
      status: agentData.super_agent?.status ?? existing.status,
      package: agentData.super_agent?.package ?? Number(existing.package),
    };

    const validation = await validateInput(updateSuperAgentSchema, { super_agent: agentUpdates });
    if (validation.status !== "success") {
      return res.status(400).json({
        status: "fail",
        message: "Validation error",
        errors: validation.errors,
      });
    }

    existing.status = agentUpdates.status;
    existing.package = agentUpdates.package;

    if (existing.user) {
      if (first_name) existing.user.first_name = first_name;
      if (last_name) existing.user.last_name = last_name;
      if (username) existing.user.username = username;
      if (phone) existing.user.phone = phone;
      if (password) existing.user.password = await hashPassword(password);
    }

    const updated = await SuperAgentRepository.getRepo().saveWithUser(existing);
    const persisted = await SuperAgentRepository.getRepo().findById(id);

    res.status(200).json(createResponse("success", "Super Agent updated successfully", persisted));
  } catch (error) {
    next(new AppError("Error updating super agent", 500, "Operational", error));
  }
};

export const deleteSuperAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const agent = await SuperAgentRepository.getRepo().findById(id);
    if (!agent) {
      return res.status(404).json(createResponse("fail", "Super Agent not found", []));
    }

    await SuperAgentRepository.getRepo().deleteWithUser(agent);
    res.status(200).json(createResponse("success", "Super Agent deleted successfully", []));
  } catch (error) {
    next(new AppError("Error deleting super agent", 500, "Operational", error));
  }
};
export const topUpForAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { admin_id, new_package } = req.body;

    const admin = await AdminRepository.getRepo().findById(admin_id);
    const superAgent = await SuperAgentRepository.getRepo().findById(id);

    if (!new_package) {
      return res.status(404).json(createResponse("fail", "Package can not be empty!", []));
    }

    if (!superAgent) {
      return res.status(404).json(createResponse("fail", "Agent not found", []));
    }

    if (!admin) {
      return res.status(404).json(createResponse("fail", "Admin not found", []));
    }

    const parsedNewPackage = Number(new_package);
    if (isNaN(parsedNewPackage)) {
      return res.status(400).json(createResponse("fail", "Invalid package value", []));
    }


    const updated_admin_package = Number(admin.package) + parsedNewPackage;
    const updated_super_agent_package=Number(superAgent.package) - parsedNewPackage;
    if(updated_super_agent_package<0){
        return res.status(400).json(createResponse("fail", "Insufficient balance please recharge your account", []));
    }
    AdminRepository.getRepo().update(admin,{package:updated_admin_package});
    SuperAgentRepository.getRepo().update(superAgent,{package:updated_super_agent_package})

    res.status(200).json(createResponse("success", "Admin information updated successfully", admin));
  } catch (error) {
    next(new AppError("Error updating admin package", 500, "Operational", error));
  }
};
