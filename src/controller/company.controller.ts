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

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validationStatus = await validateInput<SuperInterface>(companySchema, req.body);

    if (validationStatus.status !== "success") {
      console.log(validationStatus);
      return next(new AppError("Invalid Request", 400, "Operational"));
    }

    const { company, password, confirm_password, username, first_name, last_name, phone } = req.body;

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
      password: hashedPassword,
      phone,
      role: UserRole.Company,
    });

    const newCompany = await CompanyRepository.getRepo().register({
      ...company,
      user,
    });

    res.status(201).json(createResponse("success", "Company signup completed successfully", newCompany));
  } catch (error) {
    console.log(error);
    return next(new AppError("Error occurred. Please try again.", 400, "Operational"));
  }
};

export const getCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companies = await CompanyRepository.getRepo().find();
    res.status(200).json(createResponse("success", "Companies fetched successfully", companies));
  } catch (error) {
    next(new AppError("Failed to fetch companies", 500, "Operational"));
  }
};

export const getOneCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const company = await CompanyRepository.getRepo().findById(id);

    if (!company) {
      return next(new AppError("Company not found", 404, "Operational"));
    }

    res.status(200).json(createResponse("success", "Company fetched successfully", company));
  } catch (error) {
    next(new AppError("Error occurred. Please try again.", 400, "Operational"));
  }
};

export const updateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const existingCompany = await CompanyRepository.getRepo().findById(id);

    if (!existingCompany) {
      res.status(404).json(createResponse("error", "Company not found", []));
      return;
    }

    // Destructure request body
    const {
      company: companyData,
      first_name,
      last_name,
      username,
      phone,
      password,
      confirm_password
    } = req.body;

    // Validate company data if provided
    if (companyData) {
      const validation = await validateInput(updateCompanySchema, { company: companyData });
      if (validation.status !== "success") {
        res.status(400).json({
          status: "fail",
          message: "Validation error",
          errors: validation.errors,
        });
        return;
      }

      // Update company fields
      if (companyData.net_earning !== undefined) {
        existingCompany.net_earning = companyData.net_earning;
      }
      if (companyData.fee_percentage !== undefined) {
        existingCompany.fee_percentage = companyData.fee_percentage;
      }
    }

    // Update user fields if provided
    if (existingCompany.user) {
      if (first_name) existingCompany.user.first_name = first_name;
      if (last_name) existingCompany.user.last_name = last_name;
      if (username) existingCompany.user.username = username;
      if (phone) existingCompany.user.phone = phone;
      if (password) existingCompany.user.password = await hashPassword(password);
    }

    // Save the updated company
    const updatedCompany = await CompanyRepository.getRepo().saveWithUser(existingCompany);

    // Return response
    res.status(200).json({
      status: "success",
      message: "Company updated successfully",
      data: {
        payload: {
          id: updatedCompany.id,
          net_earning: updatedCompany.net_earning,
          fee_percentage: updatedCompany.fee_percentage,
          first_name: updatedCompany.user?.first_name,
          last_name: updatedCompany.user?.last_name,
          username: updatedCompany.user?.username,
          phone: updatedCompany.user?.phone,
          updated_at: new Date()
        }
      }
    });

  } catch (error) {
    next(new AppError("Error updating company", 500, "Operational", error));
  }
};
export const deleteCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const company = await CompanyRepository.getRepo().findById(id);

    if (!company) {
      res.status(404).json(createResponse("fail", "Company not found", []));
      return;
    }

    await CompanyRepository.getRepo().deleteWithUser(company);
    res.status(200).json(createResponse("success", "Company deleted successfully", []));
  } catch (error) {
    next(new AppError("Error deleting company", 500, "Operational", error));
  }
};

export const createDefaultCompany = async () => {
  const username = "biruk@company";

  const existingUser = await UserRepository.getRepo().findByUsername(username);
  if (existingUser) return;

  const hashedPassword = await hashPassword("12345678");


  const user = await UserRepository.getRepo().register({
    first_name: "Biruk",
    last_name: "Bingo",
    username,
    password: hashedPassword,
    role: UserRole.Company,
  });
  console.log("User is ", user);

  await CompanyRepository.getRepo().register({
    net_earning: 0,
    fee_percentage: 15,
    user,
  });

  console.log("✅ Default company created.");
};
export const companyEarnings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const company = await CompanyRepository.getRepo().findById(id);

    if (!company) {
      return next(new AppError("Company not found", 404, "Operational"));
    }
    const allCompletedGames = company.admin.flatMap(admin =>
      admin.cashers.flatMap(casher =>
        casher.game.filter(game => game.status === "completed")
      )
    );
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    const weekStart = new Date(todayStart);
    weekStart.setUTCDate(todayStart.getUTCDate() - (todayStart.getUTCDay() || 7) + 1);
    
    const monthStart = new Date(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth(), 1)); 
    const yearStart = new Date(Date.UTC(todayStart.getUTCFullYear(), 0, 1));
    
    const filterByDate = (games: any[], startDate: Date) =>
      games.filter(game => new Date(game.created_at).getTime() >= startDate.getTime());
    const calculateEarnings = (games: any[]) =>
      games.reduce((total, game) => total + parseFloat(game.admin_price), 0);

    // Prepare metrics


    const earnings = {
      createdAt: company.user.created_at,
      feePercentage: company.fee_percentage,
      netEarning: company.net_earning,
      totalAdmins: company.admin.length,
      totalCashers: company.admin.reduce((sum, admin) => sum + admin.cashers.length, 0),
      totalGames: allCompletedGames.length,
      first_name: company.user.first_name,
      last_name: company.user.last_name,
      username: company.user.username,
      today: calculateEarnings(filterByDate(allCompletedGames, todayStart)),
      thisWeek: calculateEarnings(filterByDate(allCompletedGames, weekStart)),
      thisMonth: calculateEarnings(filterByDate(allCompletedGames, monthStart)),
      thisYear: calculateEarnings(filterByDate(allCompletedGames, yearStart)),
      allTime: calculateEarnings(allCompletedGames)
    }

    res.status(200).json(createResponse(
      "success",
      "Company metrics calculated successfully",
      earnings
    ));

  } catch (error) {
    console.log("Error calculating company earnings:", error);
    next(new AppError("Failed to calculate company metrics", 500, "Operational", error));
  }
};