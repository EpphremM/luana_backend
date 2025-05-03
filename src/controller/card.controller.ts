
import { NextFunction, Request, Response } from "express";
import { AppError } from "../express/error/app.error";
import { CartelaInterface } from "../database/type/cartela/cartela.interface";
import { CartelaRepository } from "../database/repositories/cartela.repository";
import { createResponse } from "../express/types/response.body";
import { CardRepository } from "../database/repositories/card.repositor";
import { CardInterface } from "../database/type/card/card.interface";
import { validateInput } from "../zod/middleware/zod.validation";
import { CardSchema } from "../zod/schemas/card.schema";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: CardInterface = req.body;
        const card = await CardRepository.getRepo().register(body);
        const existingCard = await CardRepository.getRepo().findBynumber(body.number);
        const validationStatus = await validateInput<CardInterface>(CardSchema, req.body);
        if (validationStatus.status !== "success") {
            console.log(validationStatus);
            return next(new AppError("Invalid Request", 400, "Operational"));
        }
        if (existingCard) {
            return next(new AppError("User already registered", 400, "OperationalError"));
        }

        if (!card) {
            return next(new AppError("Couldnt cartela", 400, "OperationalError"));
        }

        return res.status(200).json(createResponse("success", "cartela created successfully", card))

    } catch (error) {
        console.log(error);
        next(new AppError("Cartela registration error", 400, "Operational", error))
    }
}

export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const result = await CardRepository.getRepo().Delete(id);
        if (result) {
            res.status(200).json(createResponse("success", "Cartela deleted successfully", []))
        }

    } catch (error) {
        console.log(error);
        next(new AppError("Error occured during deleting cartela", 400, error))
    }
}