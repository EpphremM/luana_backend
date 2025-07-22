"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawGame = exports.updateCompletedGameStatus = exports.updateWinGame = exports.deleteGame = exports.updateGame = exports.getGamesByCasherId = exports.getOneGame = exports.getSuperAgentSalesReport = exports.getFilteredAdminSales = exports.getAllGames = exports.createGame = void 0;
const game_schema_1 = require("../zod/schemas/game.schema");
const zod_validation_1 = require("../zod/middleware/zod.validation");
const game_repository_1 = require("../database/repositories/game.repository");
const app_error_1 = require("../express/error/app.error");
const response_body_1 = require("../express/types/response.body");
const admin_repository_1 = require("../database/repositories/admin.repository");
const company_repository_1 = require("../database/repositories/company.repository");
const casher_repository_1 = require("../database/repositories/casher.repository");
const super_agent_repository_1 = require("../database/repositories/super.agent.repository");
const createGame = async (req, res, next) => {
    try {
        const validationStatus = await (0, zod_validation_1.validateInput)(game_schema_1.createGameSchema, req.body);
        if (validationStatus.status !== "success") {
            console.log(validationStatus);
            return next(new app_error_1.AppError("Invalid game data", 400));
        }
        const newGame = await game_repository_1.GameRepository.getRepo().register(req.body);
        res.status(201).json((0, response_body_1.createResponse)("success", "Game created successfully", newGame));
    }
    catch (error) {
        next(new app_error_1.AppError("Error creating game", 500, "Operational", error));
    }
};
exports.createGame = createGame;
const getAllGames = async (req, res, next) => {
    try {
        const paginationDto = req.query;
        const games = await game_repository_1.GameRepository.getRepo().find(paginationDto);
        res.status(200).json((0, response_body_1.createResponse)("success", "Games fetched successfully", games));
    }
    catch (error) {
        next(new app_error_1.AppError("Error fetching games", 500, "Operational", error));
    }
};
exports.getAllGames = getAllGames;
const getFilteredAdminSales = async (req, res, next) => {
    try {
        const paginationDto = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10,
        };
        const filters = {
            admin_id: req.query.admin_id,
            casher_id: req.query.casher_id ? Number(req.query.casher_id) : undefined,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
        };
        // const admin=await AdminRepository.getRepo().findById(admin_)
        const data = await game_repository_1.GameRepository.getRepo().findAdminSales(paginationDto, filters);
        res.status(200).json({
            status: "success",
            message: "Filtered sales data fetched successfully",
            data,
        });
    }
    catch (error) {
        next(new app_error_1.AppError("Error fetching filtered sales data", 500, "Operational", error));
    }
};
exports.getFilteredAdminSales = getFilteredAdminSales;
const getSuperAgentSalesReport = async (req, res, next) => {
    try {
        const pagination = {
            page: req.query.page ? parseInt(req.query.page, 10) : 1,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
        };
        const filters = {
            super_agent_id: req.query.super_agent_id,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
        };
        const parsedLimit = Math.min(100, Math.max(1, pagination.limit));
        const parsedPage = Math.max(1, pagination.page);
        const skip = (parsedPage - 1) * parsedLimit;
        const now = new Date();
        const todayUTCStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const allAdmins = await admin_repository_1.AdminRepository.getRepo().findll();
        const todayAdminAggregates = allAdmins.map((admin) => {
            let totalSales = 0;
            let totalAdminEarnings = 0;
            let totalCompanyEarnings = 0;
            let totalGames = 0;
            let totalPlayerBets = 0;
            const games = admin.cashers.flatMap((casher) => (casher.game || []).filter((game) => {
                const createdAt = new Date(game.created_at);
                return game.status === "completed" && createdAt.getTime() >= todayUTCStart.getTime();
            }));
            games.forEach((game) => {
                const derash = Number(game.derash ?? 0);
                const playerBet = Number(game.player_bet ?? 0);
                const totalPlayers = Number(game.total_player ?? 0);
                const playerTotalBet = playerBet * totalPlayers;
                totalSales += derash;
                totalAdminEarnings += Number(game.admin_price ?? 0);
                totalCompanyEarnings += Number(game.company_comission ?? 0);
                totalPlayerBets += playerTotalBet;
                totalGames++;
            });
            return {
                admin_id: admin.id,
                firstName: admin.user?.first_name ?? "",
                lastName: admin.user?.last_name ?? "",
                fee_percentage: admin.fee_percentage,
                totalSales,
                totalPlayerBets,
                totalCut: totalPlayerBets - totalSales,
                totalAdminEarnings,
                totalCompanyEarnings,
                totalGames,
            };
        }).filter((entry) => entry.totalGames > 0);
        const sortedToday = todayAdminAggregates.sort((a, b) => b.totalSales - a.totalSales);
        const paginatedToday = sortedToday.slice(skip, skip + parsedLimit);
        const todaySummary = sortedToday.reduce((acc, cur) => {
            acc.totalSales += cur.totalSales;
            acc.totalPlayerBets += cur.totalPlayerBets;
            acc.totalCut += cur.totalCut;
            acc.totalAdminEarnings += cur.totalAdminEarnings;
            acc.totalCompanyEarnings += cur.totalCompanyEarnings;
            acc.totalGames += cur.totalGames;
            return acc;
        }, {
            totalSales: 0,
            totalPlayerBets: 0,
            totalCut: 0,
            totalAdminEarnings: 0,
            totalCompanyEarnings: 0,
            totalGames: 0,
        });
        const todayPages = Math.ceil(sortedToday.length / parsedLimit);
        let filteredReport = null;
        if (filters.super_agent_id) {
            filteredReport = await super_agent_repository_1.SuperAgentRepository.getRepo().findSuperAgentSalesReport(pagination, filters);
        }
        return res.status(200).json((0, response_body_1.createResponse)("success", "Report retrieved", {
            payload: {
                per_admin: paginatedToday,
                overall_summary: todaySummary,
                pagination: {
                    totalItems: sortedToday.length,
                    itemCount: paginatedToday.length,
                    itemsPerPage: parsedLimit,
                    totalPages: todayPages,
                    currentPage: parsedPage,
                    hasNextPage: parsedPage < todayPages,
                    hasPreviousPage: parsedPage > 1,
                },
                filtered: filteredReport?.data?.payload ?? null,
            }
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.getSuperAgentSalesReport = getSuperAgentSalesReport;
const getOneGame = async (req, res, next) => {
    try {
        const { id } = req.params;
        const game = await game_repository_1.GameRepository.getRepo().findById(id);
        if (!game) {
            return next(new app_error_1.AppError("Game not found", 404, "Operational"));
        }
        res.status(200).json((0, response_body_1.createResponse)("success", "Game fetched successfully", game));
    }
    catch (error) {
        next(new app_error_1.AppError("Error fetching game", 500, "Operational", error));
    }
};
exports.getOneGame = getOneGame;
const getGamesByCasherId = async (req, res, next) => {
    try {
        const pagination = req.query;
        const { id } = req.params;
        const game = await game_repository_1.GameRepository.getRepo().findGameByCasherId(id, pagination);
        if (!game) {
            return next(new app_error_1.AppError("Game not found", 404, "Operational"));
        }
        res.status(200).json((0, response_body_1.createResponse)("success", "Game fetched successfully", game));
    }
    catch (error) {
        next(new app_error_1.AppError("Error fetching game", 500, "Operational", error));
    }
};
exports.getGamesByCasherId = getGamesByCasherId;
const updateGame = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validationStatus = await (0, zod_validation_1.validateInput)(game_schema_1.updateGameSchema, req.body);
        if (validationStatus.status !== "success") {
            return next(new app_error_1.AppError("Invalid update data", 400));
        }
        console.log("Request body for the updated game data", req.body);
        const { status, winner_cards, total_calls } = req.body;
        const existingGame = await game_repository_1.GameRepository.getRepo().findById(id);
        if (!existingGame) {
            return next(new app_error_1.AppError("Game not found", 404, "Operational"));
        }
        const updatedGame = await game_repository_1.GameRepository.getRepo().update(existingGame, {
            status,
            winner_cards,
            total_calls,
        });
        res.status(200).json((0, response_body_1.createResponse)("success", "Game updated successfully", updatedGame));
    }
    catch (error) {
        next(new app_error_1.AppError("Error updating game", 500, "Operational", error));
    }
};
exports.updateGame = updateGame;
const deleteGame = async (req, res, next) => {
    try {
        const { id } = req.params;
        const game = await game_repository_1.GameRepository.getRepo().findById(id);
        if (!game) {
            return next(new app_error_1.AppError("Game not found", 404, "Operational"));
        }
        await game_repository_1.GameRepository.getRepo().delete(id);
        res.status(200).json((0, response_body_1.createResponse)("success", "Game deleted successfully", null));
    }
    catch (error) {
        next(new app_error_1.AppError("Error deleting game", 500, "Operational", error));
    }
};
exports.deleteGame = deleteGame;
const getExistingCompanyIncomes = async (company_id, new_net_earning) => {
    try {
        const company = await company_repository_1.CompanyRepository.getRepo().findById(company_id);
        if (!company)
            return null;
        return {
            net_earning: parseFloat((Number(company.net_earning) + Number(new_net_earning)).toFixed(2))
        };
    }
    catch (error) {
        console.error("Error getting company incomes:", error);
        return null;
    }
};
const getExistingAdminIncomes = async (admin_id, gameProfit) => {
    try {
        const admin = await admin_repository_1.AdminRepository.getRepo().findById(admin_id);
        if (!admin)
            return null;
        const total_earning = parseFloat(admin.total_earning.toString());
        const net_earning = parseFloat(admin.net_earning.toString());
        const packagge = parseFloat(admin.package.toString());
        const fee_percentage = parseFloat(admin.fee_percentage.toString());
        gameProfit = parseFloat(gameProfit.toString());
        const admin_price = parseFloat(((fee_percentage * gameProfit) / 100).toFixed(2));
        return {
            admin,
            fee_percentage,
            admin_price,
            updated_total_earning: parseFloat((total_earning + gameProfit).toFixed(2)),
            updated_net_earning: parseFloat((net_earning) + (gameProfit).toFixed(2)),
            updated_package: parseFloat((packagge - ((gameProfit))).toFixed(2)),
        };
    }
    catch (error) {
        console.error("Error getting admin incomes:", error);
        return null;
    }
};
const updateAdminIncomes = async (admin_id, gameProfit) => {
    try {
        const existingAdminData = await getExistingAdminIncomes(admin_id, gameProfit);
        if (!existingAdminData)
            throw new Error("Admin data not found");
        const updatedAdmin = await admin_repository_1.AdminRepository.getRepo().update(existingAdminData.admin, {
            total_earning: existingAdminData.updated_total_earning,
            // net_earning: existingAdminData.updated_net_earning,
            package: existingAdminData.updated_package,
        });
        return existingAdminData.admin_price;
    }
    catch (error) {
        console.error("Error updating admin incomes:", error);
        throw error;
    }
};
const updateCompanyIncomes = async (company_id, admin_price) => {
    try {
        admin_price = parseFloat(admin_price.toString());
        const existingCompanyEarning = await getExistingCompanyIncomes(company_id, admin_price);
        if (!existingCompanyEarning)
            throw new Error("Company data not found");
        const existingCompanyData = await company_repository_1.CompanyRepository.getRepo().findById(company_id);
        if (!existingCompanyData)
            throw new Error("Company not found");
        const updatedCompany = await company_repository_1.CompanyRepository.getRepo().update(existingCompanyData, {
            net_earning: existingCompanyEarning.net_earning
        });
    }
    catch (error) {
        console.error("Error updating company incomes:", error);
        throw error;
    }
};
const updateWinGame = async (req, res, next) => {
    try {
        const { id } = req.params;
        let { gameProfit, game_id, winnerCartela } = req.body;
        gameProfit = parseFloat(gameProfit.toString());
        const gameStatus = await getGameStatus(game_id);
        // if (gameStatus === "completed") {
        //     return next(new AppError("Game already updated", 400, "Operational"));
        // }
        const casher = await casher_repository_1.CasherRepository.getRepo().findById(id);
        if (!casher || !casher.admin) {
            return next(new app_error_1.AppError("Casher or admin not found", 400, "Operational"));
        }
        const admin_id = casher.admin.id;
        const company_id = casher.admin.company.id;
        const admin_price = await updateAdminIncomes(admin_id, gameProfit);
        await updateCompanyIncomes(company_id, admin_price);
        await (0, exports.updateCompletedGameStatus)(game_id, winnerCartela);
        res.status(200).json((0, response_body_1.createResponse)("success", "Game updated successfully", []));
    }
    catch (error) {
        console.error("Full error stack:", error);
        next(new app_error_1.AppError("Error occurred during game update", 400, "Operational", error));
    }
};
exports.updateWinGame = updateWinGame;
const updateCompletedGameStatus = async (game_id, winnerCartela) => {
    try {
        const existingGame = await game_repository_1.GameRepository.getRepo().findById(game_id);
        if (!existingGame)
            return;
        await game_repository_1.GameRepository.getRepo().update(existingGame, { status: "completed", winner_cards: winnerCartela });
        return;
    }
    catch (error) {
        console.log(error);
    }
    return null;
};
exports.updateCompletedGameStatus = updateCompletedGameStatus;
const drawGame = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { cashier_id, winnerCartelas } = req.body;
        const existingGame = await game_repository_1.GameRepository.getRepo().findById(id);
        console.log("Exising game status is", existingGame.status);
        if (!existingGame) {
            return next(new app_error_1.AppError("Game not found", 400, "Operational"));
        }
        console.log("Existing game found:", existingGame.id);
        if (existingGame.status === "draw") {
            return next(new app_error_1.AppError("Game already updated", 400, "Operational"));
        }
        if (existingGame.casher_id !== cashier_id || existingGame.winner_cards.length < 2) {
            return next(new app_error_1.AppError("Invalid game or invalid user from draw game", 400, "Operational"));
        }
        const cashier = await casher_repository_1.CasherRepository.getRepo().findById(cashier_id);
        if (!cashier) {
            return next(new app_error_1.AppError("Cashier not found!", 400, "Operational"));
        }
        const admin = await admin_repository_1.AdminRepository.getRepo().findById(cashier.admin_id);
        if (!admin) {
            return next(new app_error_1.AppError("Admin not found!", 400, "Operational"));
        }
        const company = await company_repository_1.CompanyRepository.getRepo().findById(cashier.admin.company.id);
        if (!company) {
            return next(new app_error_1.AppError("Company not found!", 400, "Operational"));
        }
        const gameProfit = existingGame.total_player * existingGame.player_bet - existingGame.derash;
        console.log("Game profite is", gameProfit);
        console.log("Admin calculated package");
        const updatedGame = await game_repository_1.GameRepository.getRepo().update(existingGame, { status: "draw", winner_cards: winnerCartelas });
        const updatedAdmin = await admin_repository_1.AdminRepository.getRepo().update(admin, {
            total_earning: admin.total_earning - gameProfit,
            package: Number(admin.package) + gameProfit,
        });
        const updatedCompany = await company_repository_1.CompanyRepository.getRepo().update(company, {
            net_earning: Number(company.net_earning) - gameProfit,
        });
        res.status(200).json((0, response_body_1.createResponse)("success", "Draw game status updated successfully!", updatedGame));
    }
    catch (error) {
        next(new app_error_1.AppError("Error occurred during game update", 400, "Operational", error));
    }
};
exports.drawGame = drawGame;
const getGameStatus = async (game_id) => {
    try {
        const game = await game_repository_1.GameRepository.getRepo().findById(game_id);
        if (!game)
            return null;
        return game.status;
    }
    catch (error) {
        console.log(error);
    }
    return null;
};
