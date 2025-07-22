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
import { SuperAgentRepository } from "../database/repositories/super.agent.repository";
import { TransactionCreateDto } from "../database/type/transaction/transaction.interface";
import { crteateTransaction } from "./transaction.controller";
import { AdminRepository } from "../database/repositories/admin.repository";

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
export const getCompanyUserName=async(req:Request,res:Response,next:NextFunction)=>{
  try{
const { id } = req.params;
    const agent = await CompanyRepository.getRepo().findUserName(id);
    if (!agent) {
      return next(new AppError("Company not found", 400, "Operational"));
    }
    res.status(200).json(createResponse("success", "Company fetched successfully", agent));
  }catch(error){
    next(new AppError("Error fetching company", 500, "Operational"));
  }
}

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
games.reduce((total, game) => 
  total + ((game.total_player * game.player_bet) - game.derash), 0);





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


export const topUpForSuperAgents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { agent_id, birrAmount } = req.body;


    const superAgent = await SuperAgentRepository.getRepo().findById(agent_id);
    const company = await CompanyRepository.getRepo().findById(id);

    if (!birrAmount) {
      return res.status(404).json(createResponse("fail", "Package can not be empty!", []));
    }

    if (!company) {
      return res.status(404).json(createResponse("fail", "Company not found", []));
    }

    if (!superAgent) {
      return res.status(404).json(createResponse("fail", "Admin not found", []));
    }

    const parsedNewPackage = Number(birrAmount);
    if (isNaN(parsedNewPackage)) {
      return res.status(400).json(createResponse("fail", "Invalid package value", []));
    }
    const packageAmount = Math.round((100 / Number(superAgent.fee_percentage) * birrAmount));
    const body: TransactionCreateDto = {
      type: "send_package",
      amount_in_birr: birrAmount,
      amount_in_package: Number(packageAmount),
      status: "completed",
      sender_id: `${company.user.id}`,
      reciever_id: `${superAgent.user.id}`
    }

    const updated_superAgent_package = Number(superAgent.package) + packageAmount;
    SuperAgentRepository.getRepo().update(superAgent, { package: updated_superAgent_package });
    const createdTransaction = await crteateTransaction(body)
    console.log("Created transaction is that happens by super agent tops up for admins is", createdTransaction);

    res.status(200).json(createResponse("success", "Super agent information updated successfully", superAgent));
  } catch (error) {
    next(new AppError("Error updating admin package", 500, "Operational", error));
  }
};


export const topUpForAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { admin_id, birrAmount } = req.body;


    const admin = await AdminRepository.getRepo().findById(admin_id);
    const company = await CompanyRepository.getRepo().findById(id);

    if (!birrAmount) {
      return res.status(404).json(createResponse("fail", "Package can not be empty!", []));
    }

    if (!company) {
      return res.status(404).json(createResponse("fail", "Company not found", []));
    }

    if (!admin) {
      return res.status(404).json(createResponse("fail", "Admin not found", []));
    }

    const parsedNewPackage = Number(birrAmount);
    if (isNaN(parsedNewPackage)) {
      return res.status(400).json(createResponse("fail", "Invalid package value", []));
    }
    const packageAmount = Math.floor((100 / Number(admin.fee_percentage) * birrAmount));
    const body: TransactionCreateDto = {
      type: "send_package",
      amount_in_birr: birrAmount,
      amount_in_package: Number(packageAmount),
      status: "completed",
      sender_id: `${company.user.id}`,
      reciever_id: `${admin.user.id}`
    }

    const updated_admin_package = Number(admin.package) + packageAmount;
    AdminRepository.getRepo().update(admin, { package: updated_admin_package });

  const createdTransaction = await crteateTransaction(body)
    console.log("Created transaction is that happens by super agent tops up for admins is", createdTransaction);
    res.status(200).json(createResponse("success", "Admin information updated successfully", admin));
  } catch (error) {
    next(new AppError("Error updating admin package", 500, "Operational", error));
  }
};
export const getAllAdminActivityStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admins = await AdminRepository.getRepo().findll();

    const now = new Date();

    const activityStatus = admins.map((admin) => {
      const allGames = admin.cashers.flatMap(casher => casher.game || []);
      const completedGames = allGames.filter(game => game.status === "completed");

      const lastGame = completedGames.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      let status: 'no_games' | 'active' | 'dormant' | 'inactive';
      let status_message: string;

      if (!lastGame) {
        status = "no_games";
        status_message = "No games created yet";
      } else {
        const lastGameDate = new Date(lastGame.created_at);
        const diffMs = now.getTime() - lastGameDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 1) {
          status = "active";
          status_message = "Active within the last 24 hours";
        } else if (diffDays < 7) {
          status = "dormant";
          status_message = `Dormant for ${diffDays} day${diffDays > 1 ? "s" : ""}`;
        } else {
          status = "inactive";
          status_message = "Inactive for a long time";
        }
      }

      return {
        admin_id: admin.id,
        first_name: admin.user?.first_name || "",
        last_name: admin.user?.last_name || "",
        username: admin.user?.username || "",
        totalGames: completedGames.length,
        lastGameAt: lastGame?.created_at || null,
        status,
        status_message,
      };
    });
    const statusPriority = {
      active: 1,
      dormant: 2,
      inactive: 3,
      no_games: 4,
    };

    const sortedStatus = activityStatus.sort((a, b) => {
      const aPriority = statusPriority[a.status];
      const bPriority = statusPriority[b.status];

      if (aPriority !== bPriority) return aPriority - bPriority;

      const aTime = a.lastGameAt ? new Date(a.lastGameAt).getTime() : 0;
      const bTime = b.lastGameAt ? new Date(b.lastGameAt).getTime() : 0;
      return bTime - aTime;
    });

    res.status(200).json(createResponse(
      "success",
      "All admin activity statuses retrieved successfully",
      sortedStatus
    ));
  } catch (error) {
    console.error("Error retrieving all admin activity:", error);
    next(new AppError("Failed to retrieve admin activity", 500, "Operational", error));
  }
};
