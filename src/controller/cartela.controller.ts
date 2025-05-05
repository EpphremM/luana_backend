
import { NextFunction, Request, Response } from "express";
import { AppError } from "../express/error/app.error";
import { CartelaInterface } from "../database/type/cartela/cartela.interface";
import { CartelaRepository } from "../database/repositories/cartela.repository";
import { createResponse } from "../express/types/response.body";
import { validateInput } from "../zod/middleware/zod.validation";
import { CartelaSchema, UpdateCartelaSchema } from "../zod/schemas/cartela.schema";

export const register=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
try{
const body:CartelaInterface=req.body;
const validationStatus=await validateInput(CartelaSchema,body);
if(validationStatus.status!=="success"){
    next(new AppError("Invalid request",400,"Operational"));
    return;
}
const existingCartela=await CartelaRepository.getRepo().findByname(body.name);
console.log("Existing cartela is",existingCartela);

if(existingCartela){
  next(new AppError("Cartela already registered",400,"Operational"));
  return;
}
const cartelas=await CartelaRepository.getRepo().register(body);
console.log("Cartela created successfully",cartelas);

     res.status(200).json(createResponse("success","cartela created successfully",cartelas))
     return;
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

export const getOne=async(req:Request,res:Response,next:NextFunction)=>{
    try{
const {id}=req.params;
const exisitngCartela=await CartelaRepository.getRepo().findById(id);
if(!exisitngCartela){
    return next(new AppError("There is no cartela with this id",404,"Operational"))
}
res.status(200).json(createResponse("success","Cartela fetched successfully",exisitngCartela));
    }catch(error){
        console.log(error);
        return next(new AppError("Couldn't find this cartela",404,"Operational",error))
    }
}

export const getAllCartela=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const cartelas=await CartelaRepository.getRepo().find();
    res.status(200).json(createResponse("success","Cartela fetched successfully",cartelas))

    }catch(error){
        console.log(error);
        return next(new AppError("Fetch error",404,"Operational"))
    }
}

export const update=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const {id}=req.params;
        const body=req.body;
        const validationStatus= await validateInput(UpdateCartelaSchema,body);
        if(validationStatus.status!=="success"){
            return next(new AppError("Invalid Request", 400, "Operational"));
        }
        const exisingCartela=await CartelaRepository.getRepo().findById(id);
        if(!exisingCartela){
            return next(new AppError("User not found",404,"Operational"))
        }
        const updatedCartela=await CartelaRepository.getRepo().update(id,body);
         res.status(200).json(createResponse("success","Cartela updated successfully",updatedCartela))


    }catch(error){
        next(new AppError("Error occured duting editing cartela",400,error));
    }
}