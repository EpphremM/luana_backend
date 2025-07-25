"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyEarnings = exports.createDefaultCompany = exports.deleteCompany = exports.updateCompany = exports.getOneCompany = exports.getCompanies = exports.signup = void 0;
const company_schema_1 = require("../zod/schemas/company.schema");
const zod_validation_1 = require("../zod/middleware/zod.validation");
const company_repository_1 = require("../database/repositories/company.repository");
const app_error_1 = require("../express/error/app.error");
const hashing_service_1 = require("../services/hashing.service");
const user_repository_1 = require("../database/repositories/user.repository");
const role_enum_1 = require("../database/enum/role.enum");
const response_body_1 = require("../express/types/response.body");
const signup = async (req, res, next) => {
    try {
        const validationStatus = await (0, zod_validation_1.validateInput)(company_schema_1.companySchema, req.body);
        if (validationStatus.status !== "success") {
            console.log(validationStatus);
            return next(new app_error_1.AppError("Invalid Request", 400, "Operational"));
        }
        const { company, password, confirm_password, username, first_name, last_name, phone } = req.body;
        if (password !== confirm_password) {
            return next(new app_error_1.AppError("Passwords must match", 400, "Operational"));
        }
        const existingUser = await user_repository_1.UserRepository.getRepo().findByUsername(username);
        if (existingUser) {
            return next(new app_error_1.AppError("User already registered", 400, "OperationalError"));
        }
        const hashedPassword = await (0, hashing_service_1.hashPassword)(password);
        const user = await user_repository_1.UserRepository.getRepo().register({
            first_name,
            last_name,
            username,
            password: hashedPassword,
            phone,
            role: role_enum_1.UserRole.Company,
        });
        const newCompany = await company_repository_1.CompanyRepository.getRepo().register({
            ...company,
            user,
        });
        res.status(201).json((0, response_body_1.createResponse)("success", "Company signup completed successfully", newCompany));
    }
    catch (error) {
        console.log(error);
        return next(new app_error_1.AppError("Error occurred. Please try again.", 400, "Operational"));
    }
};
exports.signup = signup;
const getCompanies = async (req, res, next) => {
    try {
        const companies = await company_repository_1.CompanyRepository.getRepo().find();
        res.status(200).json((0, response_body_1.createResponse)("success", "Companies fetched successfully", companies));
    }
    catch (error) {
        next(new app_error_1.AppError("Failed to fetch companies", 500, "Operational"));
    }
};
exports.getCompanies = getCompanies;
const getOneCompany = async (req, res, next) => {
    try {
        const { id } = req.params;
        const company = await company_repository_1.CompanyRepository.getRepo().findById(id);
        if (!company) {
            return next(new app_error_1.AppError("Company not found", 404, "Operational"));
        }
        res.status(200).json((0, response_body_1.createResponse)("success", "Company fetched successfully", company));
    }
    catch (error) {
        next(new app_error_1.AppError("Error occurred. Please try again.", 400, "Operational"));
    }
};
exports.getOneCompany = getOneCompany;
const updateCompany = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingCompany = await company_repository_1.CompanyRepository.getRepo().findById(id);
        if (!existingCompany) {
            res.status(404).json((0, response_body_1.createResponse)("error", "Company not found", []));
            return;
        }
        // Destructure request body
        const { company: companyData, first_name, last_name, username, phone, password, confirm_password } = req.body;
        // Validate company data if provided
        if (companyData) {
            const validation = await (0, zod_validation_1.validateInput)(company_schema_1.updateCompanySchema, { company: companyData });
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
            if (first_name)
                existingCompany.user.first_name = first_name;
            if (last_name)
                existingCompany.user.last_name = last_name;
            if (username)
                existingCompany.user.username = username;
            if (phone)
                existingCompany.user.phone = phone;
            if (password)
                existingCompany.user.password = await (0, hashing_service_1.hashPassword)(password);
        }
        // Save the updated company
        const updatedCompany = await company_repository_1.CompanyRepository.getRepo().saveWithUser(existingCompany);
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
    }
    catch (error) {
        next(new app_error_1.AppError("Error updating company", 500, "Operational", error));
    }
};
exports.updateCompany = updateCompany;
const deleteCompany = async (req, res, next) => {
    try {
        const { id } = req.params;
        const company = await company_repository_1.CompanyRepository.getRepo().findById(id);
        if (!company) {
            res.status(404).json((0, response_body_1.createResponse)("fail", "Company not found", []));
            return;
        }
        await company_repository_1.CompanyRepository.getRepo().deleteWithUser(company);
        res.status(200).json((0, response_body_1.createResponse)("success", "Company deleted successfully", []));
    }
    catch (error) {
        next(new app_error_1.AppError("Error deleting company", 500, "Operational", error));
    }
};
exports.deleteCompany = deleteCompany;
const createDefaultCompany = async () => {
    const username = "biruk@company";
    const existingUser = await user_repository_1.UserRepository.getRepo().findByUsername(username);
    if (existingUser)
        return;
    const hashedPassword = await (0, hashing_service_1.hashPassword)("12345678");
    const user = await user_repository_1.UserRepository.getRepo().register({
        first_name: "Biruk",
        last_name: "Bingo",
        username,
        password: hashedPassword,
        role: role_enum_1.UserRole.Company,
    });
    console.log("User is ", user);
    await company_repository_1.CompanyRepository.getRepo().register({
        net_earning: 0,
        fee_percentage: 15,
        user,
    });
    console.log("✅ Default company created.");
};
exports.createDefaultCompany = createDefaultCompany;
const companyEarnings = async (req, res, next) => {
    try {
        const { id } = req.params;
        const company = await company_repository_1.CompanyRepository.getRepo().findById(id);
        if (!company) {
            return next(new app_error_1.AppError("Company not found", 404, "Operational"));
        }
        const allCompletedGames = company.admin.flatMap(admin => admin.cashers.flatMap(casher => casher.game.filter(game => game.status === "completed")));
        const now = new Date();
        const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const weekStart = new Date(todayStart);
        weekStart.setUTCDate(todayStart.getUTCDate() - (todayStart.getUTCDay() || 7) + 1);
        const monthStart = new Date(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth(), 1));
        const yearStart = new Date(Date.UTC(todayStart.getUTCFullYear(), 0, 1));
        const filterByDate = (games, startDate) => games.filter(game => new Date(game.created_at).getTime() >= startDate.getTime());
        const calculateEarnings = (games) => games.reduce((total, game) => total + parseFloat(game.admin_price), 0);
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
        };
        res.status(200).json((0, response_body_1.createResponse)("success", "Company metrics calculated successfully", earnings));
    }
    catch (error) {
        console.log("Error calculating company earnings:", error);
        next(new app_error_1.AppError("Failed to calculate company metrics", 500, "Operational", error));
    }
};
exports.companyEarnings = companyEarnings;
