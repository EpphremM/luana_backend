import { NextFunction, Response, Request, response } from "express";
import { AdminInterface } from "../database/type/admin/admin.interface";
import { adminSchema, updateAdminSchema } from "../zod/schemas/admin.schema";
import { validateInput } from "../zod/middleware/zod.validation";
import { AdminRepository } from "../database/repositories/admin.repository";
import { AppError } from "../express/error/app.error";
import { hashPassword } from "../services/hashing.service";
import { UserRepository } from "../database/repositories/user.repository";
import { UserRole } from "../database/enum/role.enum";
import { createResponse } from "../express/types/response.body";
import { error } from "console";
import { PaginationDto } from "../DTO/pagination.dto";
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationStatus = await validateInput<AdminInterface>(adminSchema, req.body);

    if (validationStatus.status !== "success") {
      console.log(validationStatus.errors);
      return next(new AppError("Invalid Request", 400, "Operational"));
    }

    const { admin, password, confirm_password, username, first_name, last_name, phone } = req.body;

    // Check if the passwords match
    if (password !== confirm_password) {
      return next(new AppError("Passwords must match", 400, "Operational"));
    }

    // Check if the username already exists
    const existingUser = await UserRepository.getRepo().findByUsername(username);
    if (existingUser) {
      return next(new AppError("User already registered", 400, "OperationalError"));
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    // 1️⃣ Create and save the User first
    const user = await UserRepository.getRepo().register({
      first_name,
      last_name,
      username,
      password: hashedPassword,
      phone,
      role: UserRole.Admin,
    });

    // 2️⃣ Create the associated Admin
    const newAdmin = await AdminRepository.getRepo().register({
      ...admin,
      user,
    });

    // Respond with a success message
    res.status(201).json(createResponse("success", "Admin signup completed successfully", newAdmin));
  } catch (error) {
    console.error(error);
    next(new AppError("Error occurred. Please try again.", 400, "Operational"));
  }
};
export const getAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination: PaginationDto = req.query as unknown as PaginationDto;
    const admins = await AdminRepository.getRepo().find(pagination);

    res.status(200).json(createResponse("success", "Admins fetched successfully", admins));
  } catch (error) {
    console.error("Error fetching admins:", error);
    next(new AppError("Failed to fetch admins", 500, "Operational"));
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  const adminRepo = AdminRepository.getRepo();
  try {
    const { id } = req.params;
    const admin = await adminRepo.findById(id);
    if (!admin) {
      return next(new AppError("User not found", 400, "Operational"))
    }
    // console.log(admin); 
    res.status(200).json(createResponse("success", "Admin fetched successfully", admin));
  } catch (error) {
    // console.log(error);
    return next(new AppError("Error occured. please try again", 400, "Operationsl"));
  }
}

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    // Make sure to load the user relation
    const existingAdmin = await AdminRepository.getRepo().findById(id);

    if (!existingAdmin) {
      res.status(404).json(createResponse("error", "Admin not found", []));
      return;
    }

    // Separate the update data
    const { password, confirm_password, first_name, last_name, phone, username, ...adminData } = req.body;

    // Prepare user updates
    const userUpdates = {
      first_name,
      last_name,
      username,
      phone,
      password
    };
    console.log("Existing admin", existingAdmin);

    // Prepare admin updates - ensure we're using the nested admin data if provided
    const adminUpdates = {
      status: adminData.admin?.status ?? existingAdmin.status,
      total_earning: adminData.admin?.total_earning ?? Number(existingAdmin.total_earning),
      net_earning: adminData.admin?.net_earning ?? Number(existingAdmin.net_earning),
      package: adminData.admin?.package ?? Number(existingAdmin.package),
      fee_percentage: adminData.admin?.fee_percentage ?? Number(existingAdmin.fee_percentage),
      cartela_id: adminData.admin?.cartela_id ?? existingAdmin.cartela_id
    };

    // Validate admin updates
    const adminValidation = await validateInput(updateAdminSchema, { admin: adminUpdates });
    if (adminValidation.status !== "success") {
      res.status(400).json({
        status: "fail",
        message: "Admin validation error",
        errors: adminValidation.errors,
      });
      return;
    }

    // Apply updates - do this carefully field by field
    existingAdmin.status = adminUpdates.status;
    existingAdmin.total_earning = adminUpdates.total_earning;
    existingAdmin.net_earning = adminUpdates.net_earning;
    existingAdmin.package = adminUpdates.package;
    existingAdmin.fee_percentage = adminUpdates.fee_percentage;
    existingAdmin.cartela_id = adminUpdates.cartela_id;

    // Update user fields
    if (existingAdmin.user) {
      if (userUpdates.first_name) existingAdmin.user.first_name = userUpdates.first_name;
      if (userUpdates.last_name) existingAdmin.user.last_name = userUpdates.last_name;
      if (userUpdates.username) existingAdmin.user.username = userUpdates.username;
      if (userUpdates.phone) existingAdmin.user.phone = userUpdates.phone;
      if (userUpdates.password) existingAdmin.user.password = await hashPassword(userUpdates.password);
    }

    // Save the changes - make sure your repository's saveWithUser method is working
    const updatedAdmin = await AdminRepository.getRepo().saveWithUser(existingAdmin);

    // Verify the update
    const persistedAdmin = await AdminRepository.getRepo().findById(id);

    // Return clean response
    res.status(200).json({
      status: "success",
      message: "Admin updated successfully",
      data: {
        payload: {
          id: persistedAdmin.id,
          status: persistedAdmin.status,
          total_earning: persistedAdmin.total_earning,
          net_earning: persistedAdmin.net_earning,
          package: persistedAdmin.package,
          fee_percentage: persistedAdmin.fee_percentage,
          first_name: persistedAdmin.user?.first_name,
          last_name: persistedAdmin.user?.last_name,
          username: persistedAdmin.user?.username,
          phone: persistedAdmin.user?.phone,
          cartela_id: persistedAdmin.cartela_id,
          updated_at: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Update error:', error);
    next(new AppError("Error updating admin", 500, "Operational", error));
  }
};
export const deleteAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Find the admin with user relation
    const admin = await AdminRepository.getRepo().findById(id);

    if (!admin) {
      res.status(404).json(createResponse("fail", "Admin not found", []));
      return;
    }

    // 2. Delete using repository method
    await AdminRepository.getRepo().deleteWithUser(admin);

    // 3. Return success response
    res.status(200).json(createResponse("success", "Admin deleted successfully", []))

  } catch (error) {
    next(new AppError("Error deleting admin", 500, "Operational", error));
  }
};

export const AdminEarnings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const admin = await AdminRepository.getRepo().findById(id);

    if (!admin) {
      return next(new AppError("Admin not found", 400, "Operational"));
    }

    const allGames = admin.cashers.flatMap(casher =>
      casher.game.filter(game => game.status === "completed")
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
        total + (game.total_player * game.player_bet) - parseFloat(game.derash),
        0);

    const earnings = {
      first_name: admin.user.first_name,
      last_name: admin.user.last_name,
      username: admin.user.username,
      package: admin.package,
      total_earning: admin.total_earning,
      net_earning: admin.net_earning,
      today: calculateEarnings(filterByDate(allGames, todayStart)),
      thisWeek: calculateEarnings(filterByDate(allGames, weekStart)),
      thisMonth: calculateEarnings(filterByDate(allGames, monthStart)),
      thisYear: calculateEarnings(filterByDate(allGames, yearStart)),
      allTime: calculateEarnings(allGames)
    };

    res.status(200).json(createResponse("success", "Admin earnings fetched successfully", earnings));

  } catch (error) {
    console.log("Error: ", error);
    next(new AppError("Failed to fetch earnings", 500, "Operational"));
  }
};