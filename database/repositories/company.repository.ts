import { AppError } from "../../express/error/app.error";
import { AppDataSource } from "../data.source";
import { SuperAdmin } from "../entities/company.entity";
import { User } from "../entities/user.entity";
import { SuperInterface } from "../type/super_admin/super.admin.interface";
import { UserInterface } from "../type/user/user.interface";

export class CompanyRepository {
    companyRepository = AppDataSource.getRepository<SuperInterface>(SuperAdmin);
    static companyRepo: CompanyRepository | null = null;
    
    private constructor() { }

    createObject(company) {
        return this.companyRepository.create(company);
    }

    async register(company) {
        return await this.companyRepository.save(company);
    }

    async find() {
        return await this.companyRepository.find({ relations: ["user"] });
    }

    async findById(id: string) {
        const company = await this.companyRepository.findOne({
            where: { id },
            relations: ["user"],
        });
        return company;
    }

    async delete(id: string) {
        return this.companyRepository.delete(id);
    }

    async update(company: SuperAdmin, updateData: Partial<SuperInterface>): Promise<SuperAdmin> {
        try {
            Object.assign(company, updateData);
            return await this.companyRepository.save(company);
        } catch (error) {
            console.error('Update error:', error);
            throw new Error('Failed to persist company updates');
        }
    }

    async saveWithUser(company): Promise<SuperAdmin> {
        const queryRunner = this.companyRepository.manager.connection.createQueryRunner();
        
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (company.user) {
                await queryRunner.manager.save(company.user);
            }

            const result = await queryRunner.manager.save(company);
            await queryRunner.commitTransaction();
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteWithUser(company): Promise<void> {
        const queryRunner = this.companyRepository.manager.connection.createQueryRunner();
        
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // First delete the company record
            await queryRunner.manager.delete(SuperAdmin, company.id);
            
            // Then delete the associated user
            if (company.user) {
                await queryRunner.manager.delete(User, company.user.id);
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    static getRepo() {
        if (!CompanyRepository.companyRepo) {
            CompanyRepository.companyRepo = new CompanyRepository();
        }
        return CompanyRepository.companyRepo;
    }
}