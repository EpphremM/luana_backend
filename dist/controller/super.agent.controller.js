"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topUpForAdmins = exports.deleteSuperAgent = exports.updateSuperAgent = exports.getSuperAgentById = exports.getSuperAgents = exports.signupSuperAgent = void 0;
const zod_validation_1 = require("../zod/middleware/zod.validation");
const super_agent_repository_1 = require("../database/repositories/super.agent.repository");
const app_error_1 = require("../express/error/app.error");
const hashing_service_1 = require("../services/hashing.service");
const user_repository_1 = require("../database/repositories/user.repository");
const role_enum_1 = require("../database/enum/role.enum");
const response_body_1 = require("../express/types/response.body");
const super_agent_schema_1 = require("../zod/schemas/super.agent.schema");
const admin_repository_1 = require("../database/repositories/admin.repository");
const transaction_controller_1 = require("./transaction.controller");
const signupSuperAgent = async (req, res, next) => {
    try {
        const validationStatus = await (0, zod_validation_1.validateInput)(super_agent_schema_1.superAgentSchema, req.body);
        console.log(validationStatus.errors);
        if (validationStatus.status !== "success") {
            return next(new app_error_1.AppError("Invalid Request", 400, "Operational"));
        }
        const { super_agent, password, confirm_password, username, first_name, last_name, phone } = req.body;
        if (password !== confirm_password) {
            return next(new app_error_1.AppError("Passwords must match", 400, "Operational"));
        }
        const existingUser = await user_repository_1.UserRepository.getRepo().findByUsername(username);
        if (existingUser) {
            return next(new app_error_1.AppError("User already registered", 400, "OperationalError"));
        }
        const hashedPassword = await (0, hashing_service_1.hashPassword)(password);
        const user = await user_repository_1.UserRepository.getRepo().register({
            first_name,
            last_name,
            username,
            password: hashedPassword,
            phone,
            role: role_enum_1.UserRole.SuperAgent,
        });
        const newSuperAgent = await super_agent_repository_1.SuperAgentRepository.getRepo().register({
            ...super_agent,
            user,
        });
        res.status(201).json((0, response_body_1.createResponse)("success", "Super Agent signup completed successfully", newSuperAgent));
    }
    catch (error) {
        console.error(error);
        next(new app_error_1.AppError("Error occurred. Please try again.", 400, "Operational"));
    }
};
exports.signupSuperAgent = signupSuperAgent;
const getSuperAgents = async (req, res, next) => {
    try {
        const pagination = req.query;
        const agents = await super_agent_repository_1.SuperAgentRepository.getRepo().find(pagination);
        res.status(200).json((0, response_body_1.createResponse)("success", "Super Agents fetched successfully", agents));
    }
    catch (error) {
        console.error("Error fetching super agents:", error);
        next(new app_error_1.AppError("Failed to fetch super agents", 500, "Operational"));
    }
};
exports.getSuperAgents = getSuperAgents;
const getSuperAgentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const agent = await super_agent_repository_1.SuperAgentRepository.getRepo().findById(id);
        if (!agent) {
            return next(new app_error_1.AppError("Super Agent not found", 400, "Operational"));
        }
        res.status(200).json((0, response_body_1.createResponse)("success", "Super Agent fetched successfully", agent));
    }
    catch (error) {
        next(new app_error_1.AppError("Error fetching super agent", 500, "Operational"));
    }
};
exports.getSuperAgentById = getSuperAgentById;
const updateSuperAgent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existing = await super_agent_repository_1.SuperAgentRepository.getRepo().findById(id);
        if (!existing) {
            return res.status(404).json((0, response_body_1.createResponse)("error", "Super Agent not found", []));
        }
        const { password, confirm_password, first_name, last_name, phone, username, ...agentData } = req.body;
        const agentUpdates = {
            status: agentData.super_agent?.status ?? existing.status,
            package: agentData.super_agent?.package ?? Number(existing.package),
        };
        const validation = await (0, zod_validation_1.validateInput)(super_agent_schema_1.updateSuperAgentSchema, { super_agent: agentUpdates });
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
            if (first_name)
                existing.user.first_name = first_name;
            if (last_name)
                existing.user.last_name = last_name;
            if (username)
                existing.user.username = username;
            if (phone)
                existing.user.phone = phone;
            if (password)
                existing.user.password = await (0, hashing_service_1.hashPassword)(password);
        }
        const updated = await super_agent_repository_1.SuperAgentRepository.getRepo().saveWithUser(existing);
        const persisted = await super_agent_repository_1.SuperAgentRepository.getRepo().findById(id);
        res.status(200).json((0, response_body_1.createResponse)("success", "Super Agent updated successfully", persisted));
    }
    catch (error) {
        next(new app_error_1.AppError("Error updating super agent", 500, "Operational", error));
    }
};
exports.updateSuperAgent = updateSuperAgent;
const deleteSuperAgent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const agent = await super_agent_repository_1.SuperAgentRepository.getRepo().findById(id);
        if (!agent) {
            return res.status(404).json((0, response_body_1.createResponse)("fail", "Super Agent not found", []));
        }
        await super_agent_repository_1.SuperAgentRepository.getRepo().deleteWithUser(agent);
        res.status(200).json((0, response_body_1.createResponse)("success", "Super Agent deleted successfully", []));
    }
    catch (error) {
        next(new app_error_1.AppError("Error deleting super agent", 500, "Operational", error));
    }
};
exports.deleteSuperAgent = deleteSuperAgent;
const topUpForAdmins = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { admin_id, birrAmount } = req.body;
        const admin = await admin_repository_1.AdminRepository.getRepo().findById(admin_id);
        const superAgent = await super_agent_repository_1.SuperAgentRepository.getRepo().findById(id);
        if (!birrAmount) {
            return res.status(404).json((0, response_body_1.createResponse)("fail", "Package can not be empty!", []));
        }
        if (!superAgent) {
            return res.status(404).json((0, response_body_1.createResponse)("fail", "Agent not found", []));
        }
        if (!admin) {
            return res.status(404).json((0, response_body_1.createResponse)("fail", "Admin not found", []));
        }
        const parsedNewPackage = Number(birrAmount);
        if (isNaN(parsedNewPackage)) {
            return res.status(400).json((0, response_body_1.createResponse)("fail", "Invalid package value", []));
        }
        const packageAmount = (100 / Number(admin.fee_percentage) * birrAmount);
        const body = {
            type: "send_package",
            amount_in_birr: birrAmount,
            amount_in_package: Number(packageAmount),
            status: "completed",
            sender_id: `${superAgent.user.id}`,
            reciever_id: `${admin.user.id}`
        };
        const updated_admin_package = Number(admin.package) + packageAmount;
        const updated_super_agent_package = Number(superAgent.package) - packageAmount;
        if (updated_super_agent_package < 0) {
            return res.status(400).json((0, response_body_1.createResponse)("fail", "Insufficient balance please recharge your account", []));
        }
        admin_repository_1.AdminRepository.getRepo().update(admin, { package: updated_admin_package });
        super_agent_repository_1.SuperAgentRepository.getRepo().update(superAgent, { package: updated_super_agent_package });
        const createdTransaction = await (0, transaction_controller_1.crteateTransaction)(body);
        console.log("Created transaction is that happens by super agent tops up for admins is", createdTransaction);
        res.status(200).json((0, response_body_1.createResponse)("success", "Admin information updated successfully", admin));
    }
    catch (error) {
        next(new app_error_1.AppError("Error updating admin package", 500, "Operational", error));
    }
};
exports.topUpForAdmins = topUpForAdmins;
