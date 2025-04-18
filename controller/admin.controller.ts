import { NextFunction, Response,Request } from "express";
import { AdminInterface } from "../database/type/admin/admin.interface";
import { adminSchema } from "../zod/schemas/admin.schema";
import { validateInput } from "../zod/middleware/zod.validation";
import { AdminRepository } from "../database/repositories/admin.repository";
import { AppError } from "../express/error/app.error";
import { hashPassword } from "../services/hashing.service";
import { UserRepository } from "../database/repositories/user.repository";
import { UserRole } from "../database/anum/role.enum";
import { createResponse } from "../express/types/response.body";
export const adminSignup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationStatus = await validateInput<AdminInterface>(adminSchema, req.body);
  
      if (validationStatus.status !== "success") {
        console.log(validationStatus.errors);
        return next(new AppError("Invalid Request", 400, "Operational"));
      }
  
      const { admin, password, confirm_password, username, first_name, last_name, role } = req.body;
  
      if (password !== confirm_password) {
        return next(new AppError("Passwords must match", 400, "Operational"));
      }
  
      const existingUser = await UserRepository.getRepo().findByUsername(username);
      if (existingUser) {
        return next(new AppError("User already registered", 400, "OperationalError"));

      }
  
      const hashedPassword = await hashPassword(password);
  
      // 1️⃣ Create and save the User first
      const user = await UserRepository.getRepo().register({
        first_name,
        last_name,
        username,
        password: hashedPassword,
        role:UserRole.Admin,
      });
      const newAdmin = await AdminRepository.getRepo().register({ ...admin,  user});
  
      res.status(201).json(createResponse("success","Admin signup completed successfully",newAdmin));
    } catch (error) {
      console.error(error);
      next(new AppError("Error occurred. Please try again.", 400, "Operational"));
    }
  };
  
  export const getAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await  AdminRepository.getRepo().find();

      res.status(200).json(createResponse("success","Admins fetched successfully",admins));
    } catch (error) {
      console.error("Error fetching admins:", error);
      next(new AppError("Failed to fetch admins", 500, "Operational"));
    }
  };
  