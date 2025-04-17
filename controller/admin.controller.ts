import { NextFunction, Response,Request } from "express";
import { AdminInterface } from "../database/type/admin/admin.interface";
import { adminSchema } from "../zod/schemas/admin.schema";
import { validateInput } from "../zod/middleware/zod.validation";
import { AdminRepository } from "../database/repositories/admin.repository";
import { AppError } from "../express/error/app.error";
import { hashPassword } from "../services/hashing.service";
import { UserRepository } from "../database/repositories/user.repository";
import { UserInterface } from "../database/type/user/user.interface";

export const adminSignup=async (req:Request,res:Response,next:NextFunction)=>{
    const adminRepo = AdminRepository.getRepo();
    try{
console.log(req.body);
        const validationStatus =await validateInput<AdminInterface>(adminSchema,req.body);

        if (validationStatus.status !== "success" ) {
            console.log(validationStatus.errors);
            next(new AppError("Invalid Request",400,"Operational"));
            return;
        }
const body:UserInterface=req.body;
const {password,confirm_password,username}=req.body;
console.log(username);
console.log(req.body)
const Previousadmin=await UserRepository.getRepo().findByUsername(username);
if(Previousadmin){
    next(new AppError("User alread registered",400,"operational"))
    return;
}
if(password!=confirm_password){
    next(new AppError("Password and confirm password must match",400,"operational"))
    return;
}
const hashedPassword:string= await hashPassword(password);
body.password=hashedPassword;
console.log(body);
const result=await UserRepository.getRepo().register(body)
res.json({status:"succcess",result});
console.log(result);
    }catch(error){
        console.log("Error is",error);
        next(new AppError("Error occured please try again",400,"Operational"));
    }
}