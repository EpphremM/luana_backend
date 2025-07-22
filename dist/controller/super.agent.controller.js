"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminActivityStatus = exports.superAgentEarningsSummary = exports.topUpForAdmins = exports.deleteSuperAgent = exports.updateSuperAgent = exports.getSuperAgentUserName = exports.getSuperAgentById = exports.getAllSuperAgents = exports.getSuperAgents = exports.signupSuperAgent = void 0;
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
const getAllSuperAgents = async (req, res, next) => {
    try {
        const superAgents = await super_agent_repository_1.SuperAgentRepository.getRepo().findAll();
        res.status(200).json((0, response_body_1.createResponse)("success", "Super Agent fetched successfully!", { data: superAgents }));
    }
    catch (error) {
        next(new app_error_1.AppError("Failed to fetch super agents", 500, "Operational"));
    }
};
exports.getAllSuperAgents = getAllSuperAgents;
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
        console.log("Fetching errror is", error);
        next(new app_error_1.AppError("Error fetching super agent", 500, "Operational"));
    }
};
exports.getSuperAgentById = getSuperAgentById;
const getSuperAgentUserName = async (req, res, next) => {
    try {
        const { id } = req.params;
        const agent = await super_agent_repository_1.SuperAgentRepository.getRepo().findUserName(id);
        if (!agent) {
            return next(new app_error_1.AppError("Super Agent not found", 400, "Operational"));
        }
        res.status(200).json((0, response_body_1.createResponse)("success", "Super Agent fetched successfully", agent));
    }
    catch (error) {
        next(new app_error_1.AppError("Error fetching super agent", 500, "Operational"));
    }
};
exports.getSuperAgentUserName = getSuperAgentUserName;
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
            fee_percentage: agentData.super_agent?.fee_percentage ?? Number(existing.fee_percentage)
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
        existing.fee_percentage = agentUpdates.fee_percentage;
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
const superAgentEarningsSummary = async (req, res, next) => {
    try {
        const { id: superAgentId } = req.params;
        const superAgent = await super_agent_repository_1.SuperAgentRepository.getRepo().findById(superAgentId);
        if (!superAgent)
            return next(new app_error_1.AppError("Super Agent not found", 404, "Operational"));
        const allCompletedGames = superAgent.admins.flatMap(admin => admin.cashers.flatMap(casher => casher.game.filter(game => game.status === "completed")));
        const now = new Date();
        const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const weekStart = new Date(todayStart);
        weekStart.setUTCDate(todayStart.getUTCDate() - (todayStart.getUTCDay() || 7) + 1);
        const monthStart = new Date(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth(), 1));
        const yearStart = new Date(Date.UTC(todayStart.getUTCFullYear(), 0, 1));
        const filterByDate = (games, startDate) => games.filter(game => new Date(game.created_at).getTime() >= startDate.getTime());
        const calculateEarnings = (games) => games.reduce((total, game) => total + ((game.total_player * game.player_bet) - game.derash), 0);
        const earnings = {
            createdAt: superAgent.user.created_at,
            totalAdmins: superAgent.admins.length,
            totalCashers: superAgent.admins.reduce((sum, admin) => sum + admin.cashers.length, 0),
            totalGames: allCompletedGames.length,
            package: superAgent.package,
            first_name: superAgent.user.first_name,
            last_name: superAgent.user.last_name,
            username: superAgent.user.username,
            today: calculateEarnings(filterByDate(allCompletedGames, todayStart)),
            thisWeek: calculateEarnings(filterByDate(allCompletedGames, weekStart)),
            thisMonth: calculateEarnings(filterByDate(allCompletedGames, monthStart)),
            thisYear: calculateEarnings(filterByDate(allCompletedGames, yearStart)),
            allTime: calculateEarnings(allCompletedGames),
        };
        res.status(200).json((0, response_body_1.createResponse)("success", "Super agent earnings summary retrieved", earnings));
    }
    catch (err) {
        console.error("Earnings summary error:", err);
        next(new app_error_1.AppError("Failed to calculate super agent earnings", 500, "Operational", err));
    }
};
exports.superAgentEarningsSummary = superAgentEarningsSummary;
const getAdminActivityStatus = async (req, res, next) => {
    try {
        const { id: superAgentId } = req.params;
        const superAgent = await super_agent_repository_1.SuperAgentRepository.getRepo().findById(superAgentId);
        if (!superAgent)
            return next(new app_error_1.AppError("Super Agent not found", 404, "Operational"));
        const now = new Date();
        const activityStatus = superAgent.admins.map((admin) => {
            const allGames = admin.cashers.flatMap(casher => casher.game || []);
            const completedGames = allGames.filter(game => game.status === "completed");
            const lastGame = completedGames.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            let status;
            let status_message;
            if (!lastGame) {
                status = "no_games";
                status_message = "No games created yet";
            }
            else {
                const lastGameDate = new Date(lastGame.created_at);
                const diffMs = now.getTime() - lastGameDate.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                if (diffDays < 1) {
                    status = "active";
                    status_message = "Active within the last 24 hours";
                }
                else if (diffDays < 7) {
                    status = "dormant";
                    status_message = `Dormant for ${diffDays} day${diffDays > 1 ? "s" : ""}`;
                }
                else {
                    status = "inactive";
                    status_message = "Inactive for a long time";
                }
            }
            return {
                admin_id: admin.id,
                first_name: admin.user?.first_name || "",
                last_name: admin.user?.last_name || "",
                username: admin.user?.username || "",
                totalGames: completedGames.length,
                lastGameAt: lastGame?.created_at || null,
                status,
                status_message,
            };
        });
        const statusPriority = {
            active: 1,
            dormant: 2,
            inactive: 3,
            no_games: 4,
        };
        const sortedActivity = activityStatus.sort((a, b) => {
            const aPriority = statusPriority[a.status];
            const bPriority = statusPriority[b.status];
            if (aPriority !== bPriority)
                return aPriority - bPriority;
            const aTime = a.lastGameAt ? new Date(a.lastGameAt).getTime() : 0;
            const bTime = b.lastGameAt ? new Date(b.lastGameAt).getTime() : 0;
            return bTime - aTime;
        });
        res.status(200).json((0, response_body_1.createResponse)("success", "Admin activity status retrieved successfully", sortedActivity));
    }
    catch (error) {
        console.error("Error getting admin activity:", error);
        next(new app_error_1.AppError("Failed to get admin activity", 500, "Operational", error));
    }
};
exports.getAdminActivityStatus = getAdminActivityStatus;
