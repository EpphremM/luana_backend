"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultCompany = void 0;
const role_enum_1 = require("../database/enum/role.enum");
const company_repository_1 = require("../database/repositories/company.repository");
const user_repository_1 = require("../database/repositories/user.repository");
const hashing_service_1 = require("../services/hashing.service");
const createDefaultCompany = async () => {
    const username = "biruk@company";
    const existingUser = await user_repository_1.UserRepository.getRepo().findByUsername(username);
    if (existingUser)
        return;
    const hashedPassword = await (0, hashing_service_1.hashPassword)("12345678");
    const user = await user_repository_1.UserRepository.getRepo().register({
        first_name: "Biruk",
        last_name: "Nati",
        username,
        password: hashedPassword,
        role: role_enum_1.UserRole.Company,
    });
    await company_repository_1.CompanyRepository.getRepo().register({
        net_earning: 0,
        fee_percentage: 0,
        user,
    });
    console.log("✅ Default company created.");
};
exports.createDefaultCompany = createDefaultCompany;
