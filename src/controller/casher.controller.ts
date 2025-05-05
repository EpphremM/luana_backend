import { NextFunction, Request, Response } from "express";
import { SuperInterface } from "../database/type/super_admin/super.admin.interface";
import { companySchema, updateCompanySchema } from "../zod/schemas/company.schema";
import { validateInput } from "../zod/middleware/zod.validation";
import { CompanyRepository } from "../database/repositories/company.repository";
import { AppError } from "../express/error/app.error";
import { hashPassword } from "../services/hashing.service";
import { UserRepository } from "../database/repositories/user.repository";
import { UserRole } from "../database/enum/role.enum";
import { createResponse } from "../express/types/response.body";
import { CasherInterface } from "../database/type/casher/casher.interface";
import { casherSchema } from "../zod/schemas/casher.schema";
import { CasherRepository } from "../database/repositories/casher.repository";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validationStatus = await validateInput<CasherInterface>(casherSchema, req.body);

    if (validationStatus.status !== "success") {
        console.log(validationStatus);
      return next(new AppError("Invalid Request", 400, "Operational"));
    }

    const { casher, password, confirm_password, username, first_name, last_name,phone } = req.body;

    if (password !== confirm_password) {
      return next(new AppError("Passwords must match", 400, "Operational"));
    }

    const existingUser = await UserRepository.getRepo().findByUsername(username);
    if (existingUser) {
      return next(new AppError("User already registered", 400, "OperationalError"));
    }

    const hashedPassword = await hashPassword(password);

    const user = await UserRepository.getRepo().register({
      first_name,
      last_name,
      username,
      phone,
      password: hashedPassword,
      role: UserRole.Casher
    });

    const newCasher = await CasherRepository.getRepo().register({
      ...casher,
      user,
    });

    res.status(201).json(createResponse("success", "Casher signup completed successfully", newCasher));
  } catch (error) {
    console.log(error);
    return next(new AppError("Error occurred. Please try again.", 400, "Operational"));
  }
};

export const getCashers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cashers = await CasherRepository.getRepo().find();
    res.status(200).json(createResponse("success", "Cashers fetched successfully", cashers));
  } catch (error) {
    console.log(error);
    next(new AppError("Failed to fetch cashers", 500, "Operational"));
  }
};

export const getOneCasher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const casher = await CasherRepository.getRepo().findById(id);
    
    if (!casher) {
      return next(new AppError("Casher not found", 404, "Operational"));
    }
    
    res.status(200).json(createResponse("success", "Casher fetched successfully", casher));
  } catch (error) {
    next(new AppError("Error occurred. Please try again.", 400, "Operational"));
  }
};

export const updateCasher = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      
      const { id } = req.params;
      const existingCasher = await CasherRepository.getRepo().findById(id);
  
      if (!existingCasher) {
        res.status(404).json(createResponse("error", "Casher not found", []));
        return;
      }
  
      // Destructure request body
      const { 
        casher: casherData, 
        first_name, 
        last_name, 
        username,
        phone,
        password,
        confirm_password
      } = req.body;
  
      // Validate company data if provided
      if (casherData) {
        const validation = await validateInput(updateCompanySchema, { company: casherData });
        if (validation.status !== "success") {
          res.status(400).json({
            status: "fail",
            message: "Validation error",
            errors: validation.errors,
          });
          return;
        }
        if (casherData.status !== undefined) {
          existingCasher.status = casherData.status;
        }
      if (existingCasher.user) {
        if (first_name) existingCasher.user.first_name = first_name;
        if (last_name) existingCasher.user.last_name = last_name;
        if (username) existingCasher.user.username = username;
        if (username) existingCasher.user.phone = username;
        if(phone) existingCasher.user.phone=phone;
        if(password) existingCasher.user.password=await hashPassword(password);
      }
  
      // Save the updated company
      const updatedCasher = await CasherRepository.getRepo().saveWithUser(existingCasher);
  
      // Return response
      res.status(200).json({
        status: "success",
        message: "Company updated successfully",
        data: {
          payload: {
            id: updatedCasher.id,
            status: updatedCasher.status,
            first_name: updatedCasher.user?.first_name,
            last_name: updatedCasher.user?.last_name,
            username: updatedCasher.user?.username,
            phone: updatedCasher.user?.phone,
            updated_at: new Date()
          }
        }
      });
    }
    } catch (error) {
      next(new AppError("Error updating company", 500, "Operational", error));
    }
  };
  
export const deleteCasher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const casher = await CasherRepository.getRepo().findById(id);

    if (!casher) {
      res.status(404).json(createResponse("fail", "Casher not found", []));
      return;
    }

    await CasherRepository.getRepo().deleteWithUser(casher);
    res.status(200).json(createResponse("success", "Casher deleted successfully", []));
  } catch (error) {
    next(new AppError("Error deleting casher", 500, "Operational", error));
  }
};

export const cashierEarnings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cashier = await CasherRepository.getRepo().findById(id);
    
    if (!cashier) {
      return next(new AppError("Cashier not found", 400, "Operational"));
    }

    const completedGames = cashier.game.filter(game => game.status === "completed");
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - todayStart.getDay());
    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const yearStart = new Date(todayStart.getFullYear(), 0, 1);
    const filterByDate = (games: any[], startDate: Date) => 
      games.filter(game => new Date(game.created_at) >= startDate);

    const calculateEarnings = (games: any[]) => 
      games.reduce((total, game) => 
        total + (game.total_player * game.player_bet) - parseFloat(game.derash), 
      0);
    const earnings = {
      first_name:cashier.user.first_name,
      last_name:cashier.user.last_name,
      status:cashier.status,
      games:cashier?.game,
      package:cashier?.admin?.package,
      today: calculateEarnings(filterByDate(completedGames, todayStart)),
      thisWeek: calculateEarnings(filterByDate(completedGames, weekStart)),
      thisMonth: calculateEarnings(filterByDate(completedGames, monthStart)),
      thisYear: calculateEarnings(filterByDate(completedGames, yearStart)),
      allTime: calculateEarnings(completedGames)
    }; 

    res.status(200).json({
      status: "success",
      message: "Cashier earnings calculated successfully",
      data: earnings
    });

  } catch (error) {
    console.log("Error calculating cashier earnings:", error);
    next(new AppError("Failed to calculate cashier earnings", 500, "Operational"));
  }
};