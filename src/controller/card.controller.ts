
import { NextFunction, Request, Response } from "express";
import { AppError } from "../express/error/app.error";
import { createResponse } from "../express/types/response.body";
import { CardRepository } from "../database/repositories/card.repositor";
import { CardInterface } from "../database/type/card/card.interface";
import { validateInput } from "../zod/middleware/zod.validation";
import { CardSchema, UpdateCardSchema } from "../zod/schemas/card.schema";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const body: CardInterface = req.body;
        const validationStatus = await validateInput<CardInterface>(CardSchema, req.body);
        if (validationStatus.status !== "success") {
            console.log(validationStatus);
            return next(new AppError("Invalid Request", 400, "Operational"));
        }
        const existingCard = await CardRepository.getRepo().findBynumber(body.number);
        if (existingCard.length!==0) {
            return next(new AppError("Card already registered", 400, "OperationalError"));
        }
        
        const card = await CardRepository.getRepo().register(body);
        
        res.status(200).json(createResponse("success", "cartela created successfully", card))
        return 

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

export const getOne=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {id}=req.body;
        const card=await CardRepository.getRepo().findById(id);
        if(!card){
            next(new AppError("card not found",404,"Operational"))
        }
        res.status(200).json(createResponse("success","Card fetched successfully",card))

    }catch(error){
        console.log(error);
        next(new AppError("Error occured during fetching cards",404,"Operational"))
    }
}
export const getALlCards=async(req:Request,res:Response,next:NextFunction)=>{
    try{
       
        const card=await CardRepository.getRepo().find();
        res.status(200).json(createResponse("success","Card fetched successfully",card))

    }catch(error){
        console.log(error);
        next(new AppError("Error occured during fetching cards",404,"Operational"))
    }
}

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const body: CardInterface = req.body;
        const validationStatus = await validateInput<CardInterface>(UpdateCardSchema, req.body);
        const {id}=req.body;
        if (validationStatus.status !== "success") {
            console.log(validationStatus);
            return next(new AppError("Invalid Request", 400, "Operational"));
        }
        const card=await CardRepository.getRepo().findById(id);
        if(!card){
            return next(new AppError("Card not found", 404, "Operational"));
        }
        const existingCard = await CardRepository.getRepo().findBynumber(body.number);
        if (existingCard) {
            return next(new AppError("User already registered", 400, "OperationalError"));
        }
        
        const updatedCard = await CardRepository.getRepo().update(id,body);
      
        res.status(200).json(createResponse("success", "cartela updated successfully", updatedCard))
        return 

    } catch (error) {
        console.log(error);
        next(new AppError("Cartela registration error", 400, "Operational", error))
    }
}