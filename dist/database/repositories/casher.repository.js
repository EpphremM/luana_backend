"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasherRepository = void 0;
const data_source_1 = require("../data.source");
const casher_entity_1 = require("../entities/casher.entity");
const user_entity_1 = require("../entities/user.entity");
class CasherRepository {
    constructor() {
        this.casherRepository = data_source_1.AppDataSource.getRepository(casher_entity_1.Casher);
    }
    createObject(casher) {
        return this.casherRepository.create(casher);
    }
    async register(casher) {
        return await this.casherRepository.save(casher);
    }
    async find() {
        return await this.casherRepository.find({ relations: ["user", "admin", "game", "admin.company"] });
    }
    async findById(id) {
        const casher = await this.casherRepository.findOne({
            where: { id },
            relations: ["user", "game", "admin", "admin.company"],
        });
        return casher;
    }
    async delete(id) {
        return this.casherRepository.delete(id);
    }
    async update(casher, updateData) {
        try {
            Object.assign(casher, updateData);
            return await this.casherRepository.save(casher);
        }
        catch (error) {
            console.error('Update error:', error);
            throw new Error('Failed to persist casher updates');
        }
    }
    async saveWithUser(casher) {
        const queryRunner = this.casherRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (casher.user) {
                await queryRunner.manager.save(casher.user);
            }
            const result = await queryRunner.manager.save(casher);
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
    async deleteWithUser(casher) {
        const queryRunner = this.casherRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // First delete the company record
            await queryRunner.manager.delete(casher_entity_1.Casher, casher.id);
            // Then delete the associated user
            if (casher.user) {
                await queryRunner.manager.delete(user_entity_1.User, casher.user.id);
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
        if (!CasherRepository.casherRepo) {
            CasherRepository.casherRepo = new CasherRepository();
        }
        return CasherRepository.casherRepo;
    }
}
exports.CasherRepository = CasherRepository;
CasherRepository.casherRepo = null;
