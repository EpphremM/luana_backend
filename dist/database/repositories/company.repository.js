"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRepository = void 0;
const data_source_1 = require("../data.source");
const company_entity_1 = require("../entities/company.entity");
const user_entity_1 = require("../entities/user.entity");
class CompanyRepository {
    constructor() {
        this.companyRepository = data_source_1.AppDataSource.getRepository(company_entity_1.SuperAdmin);
    }
    createObject(company) {
        return this.companyRepository.create(company);
    }
    async register(company) {
        return await this.companyRepository.save(company);
    }
    async find() {
        return await this.companyRepository.find({ relations: ["user", "admin", "admin.cashers", "admin.cashers.game"] });
    }
    async findById(id) {
        const company = await this.companyRepository.findOne({
            where: { id },
            relations: ["user", "admin", "admin.cashers", "admin.cashers.game", "admin.user"],
        });
        return company;
    }
    async delete(id) {
        return this.companyRepository.delete(id);
    }
    async update(company, updateData) {
        try {
            Object.assign(company, updateData);
            return await this.companyRepository.save(company);
        }
        catch (error) {
            console.error('Update error:', error);
            throw new Error('Failed to persist company updates');
        }
    }
    async saveWithUser(company) {
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async deleteWithUser(company) {
        const queryRunner = this.companyRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.delete(company_entity_1.SuperAdmin, company.id);
            if (company.user) {
                await queryRunner.manager.delete(user_entity_1.User, company.user.id);
            }
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
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
exports.CompanyRepository = CompanyRepository;
CompanyRepository.companyRepo = null;
