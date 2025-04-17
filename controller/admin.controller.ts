import { NextFunction, Response,Request } from "express";
import { AdminInterface } from "../database/type/admin/admin.interface";
import { adminSchema } from "../zod/schemas/admin.schema";
import { validateInput } from "../zod/middleware/zod.validation";
import { AdminRepository } from "../database/repositories/admin.repository";
import { AppError } from "../express/error/app.error";
import { hashPassword } from "../services/hashing.service";
import { UserRepository } from "../database/repositories/user.repository";

export const adminSignup=async (req:Request,res:Response,next:NextFunction)=>{
    const adminRepo = AdminRepository.getRepo();
    try{

        const validationStatus =await validateInput<AdminInterface>(adminSchema,req.body);

        if (validationStatus.status !== "success" ) {
            console.log(validationStatus.errors);
            next(new AppError("Invalid Request",400,"Operational"));
            return;
        }
const body=req.body;
const {password,confirm_password}=req.body.user;
const {username}=req.body.user;
console.log(username);
console.log(req.body)
const Previousadmin=await UserRepository.getRepo().findByUsername(username);
if(!Previousadmin){
    next(new AppError("User alread registered",400,"operational"))
    return;
}
if(password!=confirm_password){
    next(new AppError("Password and confirm password must match",400,"operational"))
    return;
}
const hashedPassword:string= await hashPassword(password);
body.user.password=hashedPassword;
const result=await AdminRepository.getRepo().register({...body, ...body.user})
res.json(result)
console.log(result);
    }catch(error){
        console.log(error);
        next(new AppError("Error occured please try again",400,"Operational"));
    }
}