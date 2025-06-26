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
import { GameRepository } from "../database/repositories/game.repository";
import { PaginationDto } from "../DTO/pagination.dto";
import { GameInterface } from "../database/type/game/game.interface";
import { AdminRepository } from "../database/repositories/admin.repository";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validationStatus = await validateInput<CasherInterface>(casherSchema, req.body);

    if (validationStatus.status !== "success") {
        console.log(validationStatus);
      return next(new AppError(`Invalid Request ${req.body}`, 400, "Operational"));
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
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const weekStart = new Date(todayStart);
    const dayOfWeek = todayStart.getUTCDay();
    weekStart.setUTCDate(todayStart.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const monthStart = new Date(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth(), 1));
    const yearStart = new Date(Date.UTC(todayStart.getUTCFullYear(), 0, 1));
    
    const filterByDate = (games: any[], startDate: Date) =>
        games.filter(game => new Date(game.created_at) >= startDate);
    
    // Or more precise UTC comparison:
    const filterByDateUTC = (games: any[], startDate: Date) =>
        games.filter(game => {
            const gameDate = new Date(game.created_at);
            return gameDate >= startDate;
        });
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

export const weeklyEarnings = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const paginationDto: PaginationDto = req.query;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (today.getDay() || 7) + 1); 
    const weekEnd = new Date();
    const result = await GameRepository.getRepo().findGameByCasherId(id, paginationDto);
    
    const allGames = result.data;
    const weeklyCompletedGames = allGames.filter(game => {
      const gameDate = new Date(game.created_at);
      return game.status === "completed" && 
             gameDate >= weekStart && 
             gameDate <= weekEnd;
    });
    const dailyTotals: Record<string, {
      date: string;
      dayName: string;
      totalEarnings: number;
      gamesCount: number;
      games: any[];
    }> = {};
    const currentDate = new Date(weekStart);
    while (currentDate <= weekEnd) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = currentDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      dailyTotals[dateKey] = {
        date: formattedDate,
        dayName: dayName,
        totalEarnings: 0,
        gamesCount: 0,
        games: []
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeklyCompletedGames.forEach(game => {
      const gameDate = new Date(game.created_at);
      const dateKey = gameDate.toISOString().split('T')[0];
      
      if (dailyTotals[dateKey]) {
        dailyTotals[dateKey].totalEarnings += Number(game.admin_price);
        dailyTotals[dateKey].gamesCount += 1;
        dailyTotals[dateKey].games.push(game);
      }
    });

    const dailyEarningsArray = Object.values(dailyTotals).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    res.status(200).json(createResponse("success", "Weekly earnings calculated successfully", {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      currentDate: today.toISOString(),
      data: dailyEarningsArray,
      pagination: result.pagination
    }));

  } catch (error) {
    console.log(error);
    next(new AppError("Error calculating weekly earnings", 500, "Operational", error));
  }
};

export const weeklyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const cashier = await CasherRepository.getRepo().findById(id);
    if (!cashier) {
      return next(new AppError("Cashier not found", 404, "Operational"));
    }

    const [games] = await GameRepository.getRepo().findByCashierId(id);

    // Last 15 days
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 14); // 14 days + today = 15 days

    // Initialize empty report for last 15 days
    const report: { date: string; day: string; amount: number }[] = [];
    
    // Pre-fill all 15 days (even if no games exist)
    for (let i = 0; i < 15; i++) {
      const date = new Date(fifteenDaysAgo);
      date.setDate(date.getDate() + i);
      
      report.push({
        date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        amount: 0
      });
    }

    // Process each game
    for (const game of games) {
      const gameDate = new Date(game.created_at);
      if (gameDate >= fifteenDaysAgo) {
        const dateStr = gameDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        
        // Find the corresponding day in report
        const dayEntry = report.find(entry => entry.date === dateStr);
        if (dayEntry) {
          dayEntry.amount += typeof game.admin_price === 'string' 
            ? parseFloat(game.admin_price) 
            : Number(game.admin_price) || 0;
        }
      }
    }

    res.status(200).json({ 
      status: 'success',
      data: report.map(entry => ({
        ...entry,
        amount: entry.amount.toFixed(2)
      }))
    });

  } catch (error) {
    console.error("Error", error);
    next(new AppError("Internal server error", 500, "Operational"));
  }
};


export const findBalance=async(req:Request,res:Response,next:NextFunction)=>{
  try{
    const {id}=req.params;
    const cashier=await CasherRepository.getRepo().findById(id);
    if(!cashier){
 return next(new AppError("Cashier not found", 404, "Operational"));
    }
    res.status(200).json(createResponse("success","Cashier balace fetched successfully",{package:cashier?.admin?.package}));
    return;

  }catch(error){
    return next(new AppError("Error occured during geting cashier cashier data",400,"Operational"))
  }

}

export const updateBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cashier = await CasherRepository.getRepo().findById(id);

    if (!cashier || !cashier.admin) {
      return next(new AppError("Cashier or associated admin not found", 404, "Operational"));
    }

    const admin_id = cashier.admin.id;
    const { package: packageAmount } = req.body;

    const updated_admin = await AdminRepository.getRepo().smallUpdate(admin_id, {
      package: packageAmount,
    });

    res.status(200).json(
      createResponse("success", "Balance updated successfully", updated_admin)
    );
  } catch (error) {
    return next(
      new AppError("Error occurred during updating user balance", 400, "Operational")
    );
  }
};