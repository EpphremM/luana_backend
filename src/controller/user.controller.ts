import { NextFunction, Request, Response } from "express";
import { UserInterface } from "../database/type/user/user.interface";
import { UserRepository } from "../database/repositories/user.repository";

export const registraton=async (req:Request,res:Response,next:NextFunction)=>{
const body:UserInterface=req.body;
console.log(req.body ); 
const result=await UserRepository.getRepo().register(body);
res.status(201).json({status:"success",data:result});
}  