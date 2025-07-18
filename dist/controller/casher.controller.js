"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBalance = exports.findBalance = exports.weeklyReport = exports.weeklyEarnings = exports.cashierEarnings = exports.deleteCasher = exports.updateCasher = exports.getOneCasher = exports.getCashers = exports.signup = void 0;
const company_schema_1 = require("../zod/schemas/company.schema");
const zod_validation_1 = require("../zod/middleware/zod.validation");
const app_error_1 = require("../express/error/app.error");
const hashing_service_1 = require("../services/hashing.service");
const user_repository_1 = require("../database/repositories/user.repository");
const role_enum_1 = require("../database/enum/role.enum");
const response_body_1 = require("../express/types/response.body");
const casher_schema_1 = require("../zod/schemas/casher.schema");
const casher_repository_1 = require("../database/repositories/casher.repository");
const game_repository_1 = require("../database/repositories/game.repository");
const admin_repository_1 = require("../database/repositories/admin.repository");
const signup = async (req, res, next) => {
    try {
        const validationStatus = await (0, zod_validation_1.validateInput)(casher_schema_1.casherSchema, req.body);
        if (validationStatus.status !== "success") {
            console.log(validationStatus);
            return next(new app_error_1.AppError(`Invalid Request ${req.body}`, 400, "Operational"));
        }
        const { casher, password, confirm_password, username, first_name, last_name, phone } = req.body;
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
            phone,
            password: hashedPassword,
            role: role_enum_1.UserRole.Casher
        });
        const newCasher = await casher_repository_1.CasherRepository.getRepo().register({
            ...casher,
            user,
        });
        res.status(201).json((0, response_body_1.createResponse)("success", "Casher signup completed successfully", newCasher));
    }
    catch (error) {
        console.log(error);
        return next(new app_error_1.AppError("Error occurred. Please try again.", 400, "Operational"));
    }
};
exports.signup = signup;
const getCashers = async (req, res, next) => {
    try {
        const cashers = await casher_repository_1.CasherRepository.getRepo().find();
        res.status(200).json((0, response_body_1.createResponse)("success", "Cashers fetched successfully", cashers));
    }
    catch (error) {
        console.log(error);
        next(new app_error_1.AppError("Failed to fetch cashers", 500, "Operational"));
    }
};
exports.getCashers = getCashers;
const getOneCasher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const casher = await casher_repository_1.CasherRepository.getRepo().findById(id);
        if (!casher) {
            return next(new app_error_1.AppError("Casher not found", 404, "Operational"));
        }
        res.status(200).json((0, response_body_1.createResponse)("success", "Casher fetched successfully", casher));
    }
    catch (error) {
        next(new app_error_1.AppError("Error occurred. Please try again.", 400, "Operational"));
    }
};
exports.getOneCasher = getOneCasher;
const updateCasher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingCasher = await casher_repository_1.CasherRepository.getRepo().findById(id);
        if (!existingCasher) {
            res.status(404).json((0, response_body_1.createResponse)("error", "Casher not found", []));
            return;
        }
        // Destructure request body
        const { casher: casherData, first_name, last_name, username, phone, password, confirm_password } = req.body;
        // Validate company data if provided
        if (casherData) {
            const validation = await (0, zod_validation_1.validateInput)(company_schema_1.updateCompanySchema, { company: casherData });
            if (validation.status !== "success") {
                res.status(400).json({
                    status: "fail",
                    message: "Validation error",
                    errors: validation.errors,
                });
                return;
            }
            if (casherData.status !== undefined) {
                existingCasher.status = casherData.status;
            }
            if (existingCasher.user) {
                if (first_name)
                    existingCasher.user.first_name = first_name;
                if (last_name)
                    existingCasher.user.last_name = last_name;
                if (username)
                    existingCasher.user.username = username;
                if (username)
                    existingCasher.user.phone = username;
                if (phone)
                    existingCasher.user.phone = phone;
                if (password)
                    existingCasher.user.password = await (0, hashing_service_1.hashPassword)(password);
            }
            // Save the updated company
            const updatedCasher = await casher_repository_1.CasherRepository.getRepo().saveWithUser(existingCasher);
            // Return response
            res.status(200).json({
                status: "success",
                message: "Company updated successfully",
                data: {
                    payload: {
                        id: updatedCasher.id,
                        status: updatedCasher.status,
                        first_name: updatedCasher.user?.first_name,
                        last_name: updatedCasher.user?.last_name,
                        username: updatedCasher.user?.username,
                        phone: updatedCasher.user?.phone,
                        updated_at: new Date()
                    }
                }
            });
        }
    }
    catch (error) {
        next(new app_error_1.AppError("Error updating company", 500, "Operational", error));
    }
};
exports.updateCasher = updateCasher;
const deleteCasher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const casher = await casher_repository_1.CasherRepository.getRepo().findById(id);
        if (!casher) {
            res.status(404).json((0, response_body_1.createResponse)("fail", "Casher not found", []));
            return;
        }
        await casher_repository_1.CasherRepository.getRepo().deleteWithUser(casher);
        res.status(200).json((0, response_body_1.createResponse)("success", "Casher deleted successfully", []));
    }
    catch (error) {
        next(new app_error_1.AppError("Error deleting casher", 500, "Operational", error));
    }
};
exports.deleteCasher = deleteCasher;
const cashierEarnings = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cashier = await casher_repository_1.CasherRepository.getRepo().findById(id);
        if (!cashier) {
            return next(new app_error_1.AppError("Cashier not found", 400, "Operational"));
        }
        const completedGames = cashier.game.filter(game => game.status === "completed");
        const now = new Date();
        const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const weekStart = new Date(todayStart);
        const dayOfWeek = todayStart.getUTCDay();
        weekStart.setUTCDate(todayStart.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const monthStart = new Date(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth(), 1));
        const yearStart = new Date(Date.UTC(todayStart.getUTCFullYear(), 0, 1));
        const twoDaysAgo = new Date(todayStart);
        twoDaysAgo.setUTCDate(todayStart.getUTCDate() - 2);
        const filterByDate = (games, startDate) => games.filter(game => new Date(game.created_at) >= startDate);
        const calculateEarnings = (games) => games.reduce((total, game) => total + (game.total_player * game.player_bet) - parseFloat(game.derash), 0);
        const earnings = {
            first_name: cashier.user.first_name,
            last_name: cashier.user.last_name,
            status: cashier.status,
            games: filterByDate(completedGames, twoDaysAgo).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
            package: cashier?.admin?.package,
            today: calculateEarnings(filterByDate(completedGames, todayStart)),
            thisWeek: calculateEarnings(filterByDate(completedGames, weekStart)),
            thisMonth: calculateEarnings(filterByDate(completedGames, monthStart)),
            thisYear: calculateEarnings(filterByDate(completedGames, yearStart)),
            allTime: calculateEarnings(completedGames)
        };
        res.status(200).json({
            status: "success",
            message: "Cashier earnings calculated successfully",
            data: earnings
        });
    }
    catch (error) {
        console.log("Error calculating cashier earnings:", error);
        next(new app_error_1.AppError("Failed to calculate cashier earnings", 500, "Operational"));
    }
};
exports.cashierEarnings = cashierEarnings;
const weeklyEarnings = async (req, res, next) => {
    try {
        const { id } = req.params;
        const paginationDto = req.query;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (today.getDay() || 7) + 1);
        const weekEnd = new Date();
        const result = await game_repository_1.GameRepository.getRepo().findGameByCasherId(id, paginationDto);
        const allGames = result.data;
        const weeklyCompletedGames = allGames.filter(game => {
            const gameDate = new Date(game.created_at);
            return game.status === "completed" &&
                gameDate >= weekStart &&
                gameDate <= weekEnd;
        });
        const dailyTotals = {};
        const currentDate = new Date(weekStart);
        while (currentDate <= weekEnd) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
            const formattedDate = currentDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            dailyTotals[dateKey] = {
                date: formattedDate,
                dayName: dayName,
                totalEarnings: 0,
                gamesCount: 0,
                games: []
            };
            currentDate.setDate(currentDate.getDate() + 1);
        }
        weeklyCompletedGames.forEach(game => {
            const gameDate = new Date(game.created_at);
            const dateKey = gameDate.toISOString().split('T')[0];
            if (dailyTotals[dateKey]) {
                dailyTotals[dateKey].totalEarnings += Number(game.admin_price);
                dailyTotals[dateKey].gamesCount += 1;
                dailyTotals[dateKey].games.push(game);
            }
        });
        const dailyEarningsArray = Object.values(dailyTotals).sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        res.status(200).json((0, response_body_1.createResponse)("success", "Weekly earnings calculated successfully", {
            weekStart: weekStart.toISOString(),
            weekEnd: weekEnd.toISOString(),
            currentDate: today.toISOString(),
            data: dailyEarningsArray,
            pagination: result.pagination
        }));
    }
    catch (error) {
        console.log(error);
        next(new app_error_1.AppError("Error calculating weekly earnings", 500, "Operational", error));
    }
};
exports.weeklyEarnings = weeklyEarnings;
const weeklyReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cashier = await casher_repository_1.CasherRepository.getRepo().findById(id);
        if (!cashier) {
            return next(new app_error_1.AppError("Cashier not found", 404, "Operational"));
        }
        const [games] = await game_repository_1.GameRepository.getRepo().findByCashierId(id);
        // Last 15 days
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 14); // 14 days + today = 15 days
        // Initialize empty report for last 15 days
        const report = [];
        for (let i = 0; i < 15; i++) {
            const date = new Date(fifteenDaysAgo);
            date.setDate(date.getDate() + i);
            report.push({
                date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                day: date.toLocaleDateString('en-US', { weekday: 'long' }),
                amount: 0
            });
        }
        // Process each game
        for (const game of games) {
            const gameDate = new Date(game.created_at);
            if (gameDate >= fifteenDaysAgo) {
                const dateStr = gameDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                // Find the corresponding day in report
                const dayEntry = report.find(entry => entry.date === dateStr);
                if (dayEntry) {
                    dayEntry.amount += typeof game.admin_price === 'string'
                        ? parseFloat(game.admin_price)
                        : Number(game.admin_price) || 0;
                }
            }
        }
        res.status(200).json({
            status: 'success',
            data: report.map(entry => ({
                ...entry,
                amount: entry.amount.toFixed(2)
            }))
        });
    }
    catch (error) {
        console.error("Error", error);
        next(new app_error_1.AppError("Internal server error", 500, "Operational"));
    }
};
exports.weeklyReport = weeklyReport;
const findBalance = async (req, res, next) => {
    try {
        const { id } = req.params;
        const casher = await casher_repository_1.CasherRepository.getRepo().findById(id);
        if (!casher) {
            return next(new app_error_1.AppError("Casher not found", 404, "Operational"));
        }
        res.status(200).json((0, response_body_1.createResponse)("success", "Cashier balance fetched successfully", { package: casher?.admin?.package }));
        return;
    }
    catch (error) {
        console.log(error);
        return next(new app_error_1.AppError("Error occured during geting cashier cashier", 400, "Operational"));
    }
};
exports.findBalance = findBalance;
const updateBalance = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("Update balance id is", id);
        const cashier = await casher_repository_1.CasherRepository.getRepo().findById(id);
        if (!cashier || !cashier.admin) {
            return next(new app_error_1.AppError("Cashier or associated admin not found", 404, "Operational"));
        }
        const admin_id = cashier.admin.id;
        console.log("Admin_id", admin_id);
        const { package: packageAmount } = req.body;
        console.log("Updatable package is", packageAmount);
        console.log("An admin id is", admin_id);
        const admin = await admin_repository_1.AdminRepository.getRepo().smallUpdate(admin_id, { package: packageAmount });
        res.status(200).json((0, response_body_1.createResponse)("success", "Balance updated successfully", admin));
    }
    catch (error) {
        return next(new app_error_1.AppError("Error occurred during updating user balance", 400, "Operational"));
    }
};
exports.updateBalance = updateBalance;
