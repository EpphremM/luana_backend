"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminsBySuperAgent = exports.oneAdmin15DayReport = exports.refundGame = exports.admin15DayReport = exports.AdminEarnings = exports.deleteAdmin = exports.update = exports.getOne = exports.getAdmin = exports.signup = void 0;
const admin_schema_1 = require("../zod/schemas/admin.schema");
const zod_validation_1 = require("../zod/middleware/zod.validation");
const admin_repository_1 = require("../database/repositories/admin.repository");
const app_error_1 = require("../express/error/app.error");
const hashing_service_1 = require("../services/hashing.service");
const user_repository_1 = require("../database/repositories/user.repository");
const role_enum_1 = require("../database/enum/role.enum");
const response_body_1 = require("../express/types/response.body");
const super_agent_repository_1 = require("../database/repositories/super.agent.repository");
const signup = async (req, res, next) => {
    try {
        const validationStatus = await (0, zod_validation_1.validateInput)(admin_schema_1.adminSchema, req.body);
        if (validationStatus.status !== "success") {
            console.log(validationStatus.errors);
            return next(new app_error_1.AppError("Invalid Request", 400, "Operational"));
        }
        const { admin, password, confirm_password, username, first_name, last_name, phone } = req.body;
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
            role: role_enum_1.UserRole.Admin,
        });
        const newAdmin = await admin_repository_1.AdminRepository.getRepo().register({
            ...admin,
            user,
        });
        res.status(201).json((0, response_body_1.createResponse)("success", "Admin signup completed successfully", newAdmin));
    }
    catch (error) {
        console.error(error);
        next(new app_error_1.AppError("Error occurred. Please try again.", 400, "Operational"));
    }
};
exports.signup = signup;
const getAdmin = async (req, res, next) => {
    try {
        const pagination = req.query;
        const admins = await admin_repository_1.AdminRepository.getRepo().find(pagination);
        res.status(200).json((0, response_body_1.createResponse)("success", "Admins fetched successfully", admins));
    }
    catch (error) {
        console.error("Error fetching admins:", error);
        next(new app_error_1.AppError("Failed to fetch admins", 500, "Operational"));
    }
};
exports.getAdmin = getAdmin;
const getOne = async (req, res, next) => {
    const adminRepo = admin_repository_1.AdminRepository.getRepo();
    try {
        const { id } = req.params;
        const admin = await adminRepo.findById(id);
        if (!admin) {
            return next(new app_error_1.AppError("User not found", 400, "Operational"));
        }
        res.status(200).json((0, response_body_1.createResponse)("success", "Admin fetched successfully", admin));
    }
    catch (error) {
        return next(new app_error_1.AppError("Error occured. please try again", 400, "Operationsl"));
    }
};
exports.getOne = getOne;
const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingAdmin = await admin_repository_1.AdminRepository.getRepo().findById(id);
        if (!existingAdmin) {
            res.status(404).json((0, response_body_1.createResponse)("error", "Admin not found", []));
            return;
        }
        const { password, confirm_password, first_name, last_name, phone, username, ...adminData } = req.body;
        const userUpdates = {
            first_name,
            last_name,
            username,
            phone,
            password
        };
        let superAgent;
        if (adminData.admin.super_agent_id) {
            superAgent = await super_agent_repository_1.SuperAgentRepository.getRepo().findById(adminData.admin.super_agent_id);
            existingAdmin.super_agent = superAgent;
        }
        if (adminData.admin.super_agent_id == null) {
            existingAdmin.super_agent = null;
        }
        const adminUpdates = {
            status: adminData.admin?.status ?? existingAdmin.status,
            total_earning: adminData.admin?.total_earning ?? Number(existingAdmin.total_earning),
            net_earning: adminData.admin?.net_earning ?? Number(existingAdmin.net_earning),
            package: adminData.admin?.package ?? Number(existingAdmin.package),
            fee_percentage: adminData.admin?.fee_percentage ?? Number(existingAdmin.fee_percentage),
            super_agent_id: adminData.admin?.super_agent_id ?? existingAdmin.super_agent_id,
            cartela_id: adminData.admin?.cartela_id ?? existingAdmin.cartela_id
        };
        const adminValidation = await (0, zod_validation_1.validateInput)(admin_schema_1.updateAdminSchema, { admin: adminUpdates });
        if (adminValidation.status !== "success") {
            res.status(400).json({
                status: "fail",
                message: "Admin validation error",
                errors: adminValidation.errors,
            });
            return;
        }
        existingAdmin.status = adminUpdates.status;
        existingAdmin.total_earning = adminUpdates.total_earning;
        existingAdmin.net_earning = adminUpdates.net_earning;
        existingAdmin.package = adminUpdates.package;
        existingAdmin.fee_percentage = adminUpdates.fee_percentage;
        existingAdmin.cartela_id = adminUpdates.cartela_id;
        existingAdmin.super_agent_id = adminUpdates.super_agent_id;
        if (existingAdmin.user) {
            if (userUpdates.first_name)
                existingAdmin.user.first_name = userUpdates.first_name;
            if (userUpdates.last_name)
                existingAdmin.user.last_name = userUpdates.last_name;
            if (userUpdates.username)
                existingAdmin.user.username = userUpdates.username;
            if (userUpdates.phone)
                existingAdmin.user.phone = userUpdates.phone;
            if (userUpdates.password)
                existingAdmin.user.password = await (0, hashing_service_1.hashPassword)(userUpdates.password);
        }
        // Save the changes - make sure your repository's saveWithUser method is working
        console.log("Existing admin data is", existingAdmin);
        const updatedAdmin = await admin_repository_1.AdminRepository.getRepo().saveWithUser(existingAdmin);
        console.log("Updated admin data is", updatedAdmin);
        const persistedAdmin = await admin_repository_1.AdminRepository.getRepo().findById(id);
        res.status(200).json({
            status: "success",
            message: "Admin updated successfully",
            data: {
                payload: {
                    id: persistedAdmin.id,
                    status: persistedAdmin.status,
                    total_earning: persistedAdmin.total_earning,
                    net_earning: persistedAdmin.net_earning,
                    package: persistedAdmin.package,
                    fee_percentage: persistedAdmin.fee_percentage,
                    first_name: persistedAdmin.user?.first_name,
                    last_name: persistedAdmin.user?.last_name,
                    username: persistedAdmin.user?.username,
                    phone: persistedAdmin.user?.phone,
                    cartela_id: persistedAdmin.cartela_id,
                    super_agent_id: persistedAdmin.super_agent_id,
                    updated_at: new Date()
                }
            }
        });
    }
    catch (error) {
        console.error('Update error:', error);
        next(new app_error_1.AppError("Error updating admin", 500, "Operational", error));
    }
};
exports.update = update;
const deleteAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const admin = await admin_repository_1.AdminRepository.getRepo().findById(id);
        if (!admin) {
            res.status(404).json((0, response_body_1.createResponse)("fail", "Admin not found", []));
            return;
        }
        await admin_repository_1.AdminRepository.getRepo().deleteWithUser(admin);
        res.status(200).json((0, response_body_1.createResponse)("success", "Admin deleted successfully", []));
    }
    catch (error) {
        next(new app_error_1.AppError("Error deleting admin", 500, "Operational", error));
    }
};
exports.deleteAdmin = deleteAdmin;
const AdminEarnings = async (req, res, next) => {
    try {
        const { id } = req.params;
        const admin = await admin_repository_1.AdminRepository.getRepo().findById(id);
        if (!admin) {
            return next(new app_error_1.AppError("Admin not found", 400, "Operational"));
        }
        const allGames = admin.cashers.flatMap(casher => casher.game.filter(game => game.status === "completed"));
        const now = new Date();
        const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const weekStart = new Date(todayStart);
        weekStart.setUTCDate(todayStart.getUTCDate() - (todayStart.getUTCDay() || 7) + 1);
        const monthStart = new Date(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth(), 1));
        const yearStart = new Date(Date.UTC(todayStart.getUTCFullYear(), 0, 1));
        const filterByDate = (games, startDate) => games.filter(game => new Date(game.created_at).getTime() >= startDate.getTime());
        const calculateEarnings = (games) => games.reduce((total, game) => total + (game.total_player * game.player_bet) - parseFloat(game.derash), 0);
        const earnings = {
            first_name: admin.user.first_name,
            last_name: admin.user.last_name,
            username: admin.user.username,
            package: admin.package,
            total_earning: admin.total_earning,
            net_earning: admin.net_earning,
            today: calculateEarnings(filterByDate(allGames, todayStart)),
            thisWeek: calculateEarnings(filterByDate(allGames, weekStart)),
            thisMonth: calculateEarnings(filterByDate(allGames, monthStart)),
            thisYear: calculateEarnings(filterByDate(allGames, yearStart)),
            allTime: calculateEarnings(allGames)
        };
        res.status(200).json((0, response_body_1.createResponse)("success", "Admin earnings fetched successfully", earnings));
    }
    catch (error) {
        console.log("Error: ", error);
        next(new app_error_1.AppError("Failed to fetch earnings", 500, "Operational"));
    }
};
exports.AdminEarnings = AdminEarnings;
const admin15DayReport = async (req, res, next) => {
    try {
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 14);
        const admins = await admin_repository_1.AdminRepository.getRepo().findll();
        console.log(admins);
        const report = admins.map(admin => {
            const dailyBreakdown = [];
            for (let i = 0; i < 15; i++) {
                const date = new Date(fifteenDaysAgo);
                date.setDate(date.getDate() + i);
                dailyBreakdown.push({
                    date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                    day: date.toLocaleDateString('en-US', { weekday: 'long' }),
                    amount: 0
                });
            }
            let totalEarnings = 0;
            let totalAdminShare = 0;
            admin.cashers?.forEach(cashier => {
                cashier.game?.forEach(game => {
                    const gameDate = new Date(game.created_at);
                    const dateStr = gameDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                    const dayEntry = dailyBreakdown.find(entry => entry.date === dateStr);
                    if (dayEntry) {
                        const adminPrice = typeof game.admin_price === 'string'
                            ? parseFloat(game.admin_price)
                            : Number(game.admin_price) || 0;
                        dayEntry.amount += adminPrice;
                        totalAdminShare += adminPrice;
                        totalEarnings += (game.player_bet * game.total_player);
                    }
                });
            });
            return {
                id: admin.id,
                first_name: admin.user?.first_name,
                last_name: admin.user?.last_name,
                total_cashiers: admin.cashers?.length || 0,
                total_earnings: totalEarnings,
                admin_share: totalAdminShare,
                daily_breakdown: dailyBreakdown.map(day => ({
                    ...day,
                    amount: Number(day.amount.toFixed(2))
                }))
            };
        });
        res.status(200).json({
            status: 'success',
            data: report
        });
    }
    catch (error) {
        console.error("Error", error);
        next(new app_error_1.AppError("Internal server error", 500, "Operational"));
    }
};
exports.admin15DayReport = admin15DayReport;
const refundGame = async (req, res, next) => {
};
exports.refundGame = refundGame;
const oneAdmin15DayReport = async (req, res, next) => {
    try {
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 14);
        const admins = await admin_repository_1.AdminRepository.getRepo().findll();
        console.log(admins);
        const report = admins.map(admin => {
            const dailyBreakdown = [];
            for (let i = 0; i < 15; i++) {
                const date = new Date(fifteenDaysAgo);
                date.setDate(date.getDate() + i);
                dailyBreakdown.push({
                    date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                    day: date.toLocaleDateString('en-US', { weekday: 'long' }),
                    amount: 0
                });
            }
            let totalEarnings = 0;
            let totalAdminShare = 0;
            admin.cashers?.forEach(cashier => {
                cashier.game?.forEach(game => {
                    const gameDate = new Date(game.created_at);
                    const dateStr = gameDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                    const dayEntry = dailyBreakdown.find(entry => entry.date === dateStr);
                    if (dayEntry) {
                        const adminPrice = typeof game.admin_price === 'string'
                            ? parseFloat(game.admin_price)
                            : Number(game.admin_price) || 0;
                        dayEntry.amount += adminPrice;
                        totalAdminShare += adminPrice;
                        totalEarnings += (game.player_bet * game.total_player);
                    }
                });
            });
            return {
                id: admin.id,
                first_name: admin.user?.first_name,
                last_name: admin.user?.last_name,
                total_cashiers: admin.cashers?.length || 0,
                total_earnings: totalEarnings,
                admin_share: totalAdminShare,
                daily_breakdown: dailyBreakdown.map(day => ({
                    ...day,
                    amount: Number(day.amount.toFixed(2))
                }))
            };
        });
        res.status(200).json({
            status: 'success',
            data: report
        });
    }
    catch (error) {
        console.error("Error", error);
        next(new app_error_1.AppError("Internal server error", 500, "Operational"));
    }
};
exports.oneAdmin15DayReport = oneAdmin15DayReport;
const getAdminsBySuperAgent = async (req, res, next) => {
    try {
        const { superAgentId } = req.params;
        const pagination = req.query;
        const result = await admin_repository_1.AdminRepository.getRepo().findBySuperAgent(superAgentId, pagination);
        res.status(200).json((0, response_body_1.createResponse)("success", "Admins under super agent fetched successfully", result));
    }
    catch (error) {
        console.error("Error fetching admins by super agent:", error);
        next(new app_error_1.AppError("Failed to fetch admins", 500, "Operational"));
    }
};
exports.getAdminsBySuperAgent = getAdminsBySuperAgent;
