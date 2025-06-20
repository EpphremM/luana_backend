"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const data_source_1 = require("../data.source");
const admin_entity_1 = require("../entities/admin.entity");
const user_entity_1 = require("../entities/user.entity");
class AdminRepository {
    constructor() {
        this.adminRepository = data_source_1.AppDataSource.getRepository(admin_entity_1.Admin);
    }
    createObject(admin) {
        return this.adminRepository.create(admin);
    }
    async register(user) {
        return await this.adminRepository.save(user);
    }
    async smallUpdate(id, newAdmin) {
        await this.adminRepository.update(id, newAdmin);
        return await this.adminRepository.findOneBy({ id });
    }
    async findll() {
        return await this.adminRepository.find({ relations: ["user", "cashers", "cashers.user", "company", "cashers.game", "cartela", "cartela.cards"] });
    }
    async find(pagination) {
        const { page = 1, limit = 10 } = pagination;
        const parsedPage = Math.max(1, Number(page));
        const parsedLimit = Number(Math.min(100, Math.max(1, Number(limit)))); // Enforce reasonable limits
        const skip = (parsedPage - 1) * parsedLimit;
        const query = this.adminRepository.createQueryBuilder('admin')
            .leftJoinAndSelect('admin.cashers', 'casher')
            .leftJoinAndSelect('admin.company', 'company')
            .leftJoinAndSelect('admin.user', 'user')
            .leftJoinAndSelect('admin.cartela', 'cartela');
        const [admins, total] = await query
            .take(Number(parsedLimit))
            .skip(skip)
            .getManyAndCount();
        const totalPages = Math.ceil(total / parsedLimit);
        return {
            data: admins,
            pagination: {
                totalItems: total,
                itemCount: admins.length,
                itemsPerPage: parsedLimit,
                totalPages,
                currentPage: parsedPage,
                hasNextPage: parsedPage < totalPages,
                hasPreviousPage: parsedPage > 1,
            }
        };
    }
    async findById(id) {
        const admin = await this.adminRepository.findOne({
            where: { id },
            relations: ["user", "cashers", "cashers.user", "company", "cashers.game", "cartela", "cartela.cards"],
        });
        return admin;
    }
    async Delete(id) {
        return this.adminRepository.delete(id);
    }
    async update(admin, updateData) {
        try {
            // Remove sensitive fields that shouldn't be updated
            const { password, ...safeUpdateData } = updateData;
            // Update the admin entity with new values
            Object.assign(admin, safeUpdateData);
            // Explicitly update the user relation if needed
            if (safeUpdateData.first_name || safeUpdateData.last_name || safeUpdateData.username) {
                Object.assign(admin.user, {
                    first_name: safeUpdateData.first_name,
                    last_name: safeUpdateData.last_name,
                    username: safeUpdateData.username
                });
            }
            // Save with explicit transaction handling
            return await this.adminRepository.save(admin);
        }
        catch (error) {
            console.error('Update error:', error);
            throw new Error('Failed to persist admin updates');
        }
    }
    async saveWithUser(admin) {
        const queryRunner = this.adminRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (admin.user) {
                await queryRunner.manager.save(admin.user);
            }
            // Then save admin
            const result = await queryRunner.manager.save(admin);
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
    async deleteWithUser(admin) {
        const queryRunner = this.adminRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // 1. First delete the admin record
            await queryRunner.manager.delete(admin_entity_1.Admin, admin.id);
            // 2. Then delete the associated user
            if (admin.user) {
                await queryRunner.manager.delete(user_entity_1.User, admin.user.id);
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
        if (!AdminRepository.userRepo)
            AdminRepository.userRepo = new AdminRepository();
        return AdminRepository.userRepo;
    }
}
exports.AdminRepository = AdminRepository;
AdminRepository.userRepo = null;
