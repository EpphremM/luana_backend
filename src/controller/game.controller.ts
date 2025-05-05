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
        const paginationDto:PaginationDto=req.query;
        const games = await GameRepository.getRepo().find(paginationDto);
        res.status(200).json(createResponse("success", "Games fetched successfully", games));
    } catch (error) {
        next(new AppError("Error fetching games", 500, "Operational", error));
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
      
        const pagination:PaginationDto=req.query;
        const {id}=req.params;
        const game = await GameRepository.getRepo().findGameByCasherId(id,pagination);

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



const getCompanyIncomes=async(company_id:string)=>{
    try{
const compoanyIncomes=await CompanyRepository.getRepo().findById(company_id);
return{
    
}

    }catch(error){
        console.log(error);
    }
}
const updateCompanyIncomes=async(casher_id:string,new_net_earning:number)=>{
    try{
const casher=await CasherRepository.getRepo().findById(casher_id);
const admin_id=casher.admin.id;
const company_id=casher.admin.company.id;

    }catch(error){
        console.log(error);
    }
}

export const updateGameEarningStatus=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {id}=req.params;

    }catch(error){
        console.log(error);
        next(new AppError("Error occured duting updating earnings",400,"Operation",error))
    }
}