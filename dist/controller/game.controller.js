"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGameStatus = exports.updateWinGame = exports.deleteGame = exports.updateGame = exports.getGamesByCasherId = exports.getOneGame = exports.getAllGames = exports.createGame = void 0;
const game_schema_1 = require("../zod/schemas/game.schema");
const zod_validation_1 = require("../zod/middleware/zod.validation");
const game_repository_1 = require("../database/repositories/game.repository");
const app_error_1 = require("../express/error/app.error");
const response_body_1 = require("../express/types/response.body");
const admin_repository_1 = require("../database/repositories/admin.repository");
const company_repository_1 = require("../database/repositories/company.repository");
const casher_repository_1 = require("../database/repositories/casher.repository");
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
            console.log(validationStatus.errors);
            return next(new app_error_1.AppError("Invalid update data", 400));
        }
        const existingGame = await game_repository_1.GameRepository.getRepo().findById(id);
        if (!existingGame) {
            return next(new app_error_1.AppError("Game not found", 404, "Operational"));
        }
        const updatedGame = await game_repository_1.GameRepository.getRepo().update(existingGame, req.body);
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
        // Convert all to numbers once at the start
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
            updated_net_earning: parseFloat((net_earning + (gameProfit * (100 - fee_percentage) / 100)).toFixed(2)),
            updated_package: parseFloat((packagge - ((gameProfit * fee_percentage) / 100)).toFixed(2)),
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
            net_earning: existingAdminData.updated_net_earning,
            package: existingAdminData.updated_package,
        });
        console.log("UPdated admin is", updatedAdmin);
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
        console.log("Updated company is", updatedCompany);
    }
    catch (error) {
        console.error("Error updating company incomes:", error);
        throw error;
    }
};
const updateWinGame = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("Cshier id is", id);
        console.log("Request body is", req.body);
        let { gameProfit, game_id, winnerCartela } = req.body;
        gameProfit = parseFloat(gameProfit.toString());
        const gameStatus = await getGameStatus(game_id);
        if (gameStatus === "completed") {
            return next(new app_error_1.AppError("Game already updated", 400, "Operational"));
        }
        const casher = await casher_repository_1.CasherRepository.getRepo().findById(id);
        if (!casher || !casher.admin) {
            return next(new app_error_1.AppError("Casher or admin not found", 400, "Operational"));
        }
        const admin_id = casher.admin.id;
        const company_id = casher.admin.company.id;
        console.log("Initial values - Game Profit:", gameProfit);
        const admin_price = await updateAdminIncomes(admin_id, gameProfit);
        console.log("Calculated Admin Price:", admin_price);
        await updateCompanyIncomes(company_id, admin_price);
        await (0, exports.updateGameStatus)(game_id, winnerCartela);
        res.status(200).json((0, response_body_1.createResponse)("success", "Game updated successfully", []));
    }
    catch (error) {
        console.error("Full error stack:", error);
        next(new app_error_1.AppError("Error occurred during game update", 400, "Operational", error));
    }
};
exports.updateWinGame = updateWinGame;
const updateGameStatus = async (game_id, winnerCartela) => {
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
exports.updateGameStatus = updateGameStatus;
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
