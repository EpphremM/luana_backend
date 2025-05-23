import { UserRole } from "../database/enum/role.enum";
import { CompanyRepository } from "../database/repositories/company.repository";
import { UserRepository } from "../database/repositories/user.repository";
import { hashPassword } from "../services/hashing.service";


export const createDefaultCompany = async () => {
  const username = "biruk@company";

  const existingUser = await UserRepository.getRepo().findByUsername(username);
  if (existingUser) return; 

  const hashedPassword = await hashPassword("12345678");

  const user = await UserRepository.getRepo().register({
    first_name: "Biruk",
    last_name: "Nati",
    username,
    password: hashedPassword,
    role: UserRole.Company,
  });

  await CompanyRepository.getRepo().register({
    net_earning: 0,
    fee_percentage: 0,
    user,
  });

  console.log("✅ Default company created.");
};
