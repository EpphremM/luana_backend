
import { NextFunction, Request, Response } from "express";
import { AppError } from "../express/error/app.error";
import { CartelaInterface } from "../database/type/cartela/cartela.interface";
import { CartelaRepository } from "../database/repositories/cartela.repository";
import { createResponse } from "../express/types/response.body";

export const register=async(req:Request,res:Response,next:NextFunction)=>{
try{
const body:CartelaInterface=req.body;
const cartelas=await CartelaRepository.getRepo().register(body);
if(cartelas){
    return res.status(400).json(createResponse("success","can not create cartela",[]))
}

    return res.status(200).json(createResponse("success","cartela created successfully",cartelas))

}catch(error){
    console.log(error);
    next(new AppError("Cartela registration error",400,"Operational",error))
}
}

export const deleteCartela=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {id}=req.params;

const result=await CartelaRepository.getRepo().Delete(id);
if(result){
    res.status(200).json(createResponse("success","Cartela deleted successfully",[]))
}

    }catch(error){
        console.log(error);
        next(new AppError("Error occured during deleting cartela",400,error))
    }
}