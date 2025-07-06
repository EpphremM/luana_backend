import { NextFunction, Request, Response } from "express";

import { createGameSchema, updateGameSchema } from "../zod/schemas/game.schema";
import { validateInput } from "../zod/middleware/zod.validation";
import { GameRepository } from "../database/repositories/game.repository";
import { AppError } from "../express/error/app.error";
import { createResponse } from "../express/types/response.body";
import { GameInterface } from "../database/type/game/game.interface";
import { PaginationDto } from "../DTO/pagination.dto";
import { error } from "console";
import { AdminRepository } from "../database/repositories/admin.repository";
import { CompanyRepository } from "../database/repositories/company.repository";
import { CasherRepository } from "../database/repositories/casher.repository";
import { promises } from "dns";
import { number } from "zod";
import { SuperAgentRepository } from "../database/repositories/super.agent.repository";

export const createGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validationStatus = await validateInput<GameInterface>(createGameSchema, req.body);

        if (validationStatus.status !== "success") {
            console.log(validationStatus);
            return next(new AppError("Invalid game data", 400));
        }

        const newGame = await GameRepository.getRepo().register(req.body);

        res.status(201).json(createResponse("success", "Game created successfully", newGame));
    } catch (error) {
        next(new AppError("Error creating game", 500, "Operational", error));
    }
};

export const getAllGames = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paginationDto: PaginationDto = req.query;
        const games = await GameRepository.getRepo().find(paginationDto);
        res.status(200).json(createResponse("success", "Games fetched successfully", games));
    } catch (error) {
        next(new AppError("Error fetching games", 500, "Operational", error));
    }
};
export const getFilteredAdminSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paginationDto: PaginationDto = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10,
        };
        const filters = {
            admin_id: req.query.admin_id as string | undefined,
            casher_id: req.query.casher_id ? Number(req.query.casher_id) : undefined,
            start_date: req.query.start_date as string | undefined,
            end_date: req.query.end_date as string | undefined,
        };
        // const admin=await AdminRepository.getRepo().findById(admin_)
        const data = await GameRepository.getRepo().findAdminSales(paginationDto, filters);

        res.status(200).json({
            status: "success",
            message: "Filtered sales data fetched successfully",
            data,
        });
    } catch (error) {
        next(new AppError("Error fetching filtered sales data", 500, "Operational", error));
    }
};
export const getSuperAgentSalesReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pagination: PaginationDto = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    const filters = {
      super_agent_id: req.query.super_agent_id as string,
      start_date: req.query.start_date as string | undefined,
      end_date: req.query.end_date as string | undefined,
    };

    const report = await SuperAgentRepository.getRepo().findSuperAgentSalesReport(pagination, filters);
    return res.status(200).json(createResponse("success","Super agent data fetched successfully",{report}));
  } catch (error) {
    next(error);
  }
};
export const getOneGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const game = await GameRepository.getRepo().findById(id);

        if (!game) {
            return next(new AppError("Game not found", 404, "Operational"));
        }

        res.status(200).json(createResponse("success", "Game fetched successfully", game));
    } catch (error) {
        next(new AppError("Error fetching game", 500, "Operational", error));
    }
};
export const getGamesByCasherId = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const pagination: PaginationDto = req.query;
        const { id } = req.params;
        const game = await GameRepository.getRepo().findGameByCasherId(id, pagination);

        if (!game) {
            return next(new AppError("Game not found", 404, "Operational"));
        }

        res.status(200).json(createResponse("success", "Game fetched successfully", game));
    } catch (error) {
        next(new AppError("Error fetching game", 500, "Operational", error));
    }
};

export const updateGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const validationStatus = await validateInput<Partial<GameInterface>>(updateGameSchema, req.body);
        if (validationStatus.status !== "success") {
            console.log(validationStatus.errors)
            return next(new AppError("Invalid update data", 400));
        }

        const existingGame = await GameRepository.getRepo().findById(id);
        if (!existingGame) {
            return next(new AppError("Game not found", 404, "Operational"));
        }

        const updatedGame = await GameRepository.getRepo().update(existingGame, req.body);

        res.status(200).json(createResponse("success", "Game updated successfully", updatedGame));
    } catch (error) {
        next(new AppError("Error updating game", 500, "Operational", error));
    }
};

export const deleteGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const game = await GameRepository.getRepo().findById(id);

        if (!game) {
            return next(new AppError("Game not found", 404, "Operational"));
        }

        await GameRepository.getRepo().delete(id);

        res.status(200).json(createResponse("success", "Game deleted successfully", null));
    } catch (error) {
        next(new AppError("Error deleting game", 500, "Operational", error));
    }
};



const getExistingCompanyIncomes = async (company_id: string, new_net_earning: number) => {
    try {
        const company = await CompanyRepository.getRepo().findById(company_id);
        if (!company) return null;

        return {
            net_earning: parseFloat((Number(company.net_earning) + Number(new_net_earning)).toFixed(2))
        };
    } catch (error) {
        console.error("Error getting company incomes:", error);
        return null;
    }
};

const getExistingAdminIncomes = async (admin_id: string, gameProfit: number) => {
    try {
        const admin = await AdminRepository.getRepo().findById(admin_id);
        if (!admin) return null;

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
            updated_net_earning: parseFloat((net_earning) + (gameProfit).toFixed(2)),
            updated_package: parseFloat((packagge - ((gameProfit))).toFixed(2)),
        };
    } catch (error) {
        console.error("Error getting admin incomes:", error);
        return null;
    }
};

const updateAdminIncomes = async (admin_id: string, gameProfit: number) => {
    try {
        const existingAdminData = await getExistingAdminIncomes(admin_id, gameProfit);
        if (!existingAdminData) throw new Error("Admin data not found");

        const updatedAdmin = await AdminRepository.getRepo().update(existingAdminData.admin, {
            total_earning: existingAdminData.updated_total_earning,
            net_earning: existingAdminData.updated_net_earning,
            package: existingAdminData.updated_package,
        });
        console.log("UPdated admin is", updatedAdmin);
        return existingAdminData.admin_price;
    } catch (error) {
        console.error("Error updating admin incomes:", error);
        throw error;
    }
};

const updateCompanyIncomes = async (company_id: string, admin_price: number) => {
    try {
        admin_price = parseFloat(admin_price.toString());
        const existingCompanyEarning = await getExistingCompanyIncomes(company_id, admin_price);

        if (!existingCompanyEarning) throw new Error("Company data not found");

        const existingCompanyData = await CompanyRepository.getRepo().findById(company_id);
        if (!existingCompanyData) throw new Error("Company not found");

        const updatedCompany = await CompanyRepository.getRepo().update(existingCompanyData, {
            net_earning: existingCompanyEarning.net_earning
        });
        console.log("Updated company is", updatedCompany);
    } catch (error) {
        console.error("Error updating company incomes:", error);
        throw error;
    }
};

export const updateWinGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        console.log("Cshier id is", id)
        console.log("Request body is", req.body);
        let { gameProfit, game_id, winnerCartela } = req.body;

        gameProfit = parseFloat(gameProfit.toString());

        const gameStatus = await getGameStatus(game_id);
        if (gameStatus === "completed") {
            return next(new AppError("Game already updated", 400, "Operational"));
        }

        const casher = await CasherRepository.getRepo().findById(id);
        if (!casher || !casher.admin) {
            return next(new AppError("Casher or admin not found", 400, "Operational"));
        }

        const admin_id = casher.admin.id;
        const company_id = casher.admin.company.id;
        console.log("Initial values - Game Profit:", gameProfit);

        const admin_price = await updateAdminIncomes(admin_id, gameProfit);
        console.log("Calculated Admin Price:", admin_price);

        await updateCompanyIncomes(company_id, admin_price);
        await updateGameStatus(game_id, winnerCartela);


        res.status(200).json(createResponse("success", "Game updated successfully", []));

    } catch (error) {
        console.error("Full error stack:", error);
        next(new AppError("Error occurred during game update", 400, "Operational", error));
    }
};
export const updateGameStatus = async (game_id: string, winnerCartela) => {
    try {
        const existingGame = await GameRepository.getRepo().findById(game_id);
        if (!existingGame) return;
        await GameRepository.getRepo().update(existingGame, { status: "completed", winner_cards: winnerCartela });
        return;
    } catch (error) {
        console.log(error);
    }
    return null;
}

const getGameStatus = async (game_id: string) => {
    try {
        const game = await GameRepository.getRepo().findById(game_id);
        if (!game) return null;
        return game.status;
    } catch (error) {
        console.log(error);
    }
    return null;
}