import { NextFunction, Request, Response } from "express";
import { SuperInterface } from "../database/type/super_admin/super.admin.interface";
import { companySchema, updateCompanySchema } from "../zod/schemas/company.schema";
import { validateInput } from "../zod/middleware/zod.validation";
import { CompanyRepository } from "../database/repositories/company.repository";
import { AppError } from "../express/error/app.error";
import { hashPassword } from "../services/hashing.service";
import { UserRepository } from "../database/repositories/user.repository";
import { UserRole } from "../database/anum/role.enum";
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

    const { company, password, confirm_password, username, first_name, last_name } = req.body;

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
        username 
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
    res.status(204).json(createResponse("success", "Company deleted successfully", []));
  } catch (error) {
    next(new AppError("Error deleting company", 500, "Operational", error));
  }
};