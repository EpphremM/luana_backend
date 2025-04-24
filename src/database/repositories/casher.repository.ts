import { AppError } from "../../express/error/app.error";
import { AppDataSource } from "../data.source";
import { Casher } from "../entities/casher.entity";
import { SuperAdmin } from "../entities/company.entity";
import { User } from "../entities/user.entity";
import { CasherInterface } from "../type/casher/casher.interface";
import { SuperInterface } from "../type/super_admin/super.admin.interface";


export class CasherRepository {
    casherRepository = AppDataSource.getRepository<CasherInterface>(Casher);
    static casherRepo: CasherRepository | null = null;
    
    private constructor() { }

    createObject(casher) {
        return this.casherRepository.create(casher);
    }

    async register(casher) {
        return await this.casherRepository.save(casher);
    }

    async find() {
        return await this.casherRepository.find({ relations: ["user","admin","game"] });
    }

    async findById(id: string) {
        const casher = await this.casherRepository.findOne({
            where: { id },
            relations: ["user","game"],
        });
        return casher;
    }
 
    async delete(id: string) {
        return this.casherRepository.delete(id);
    }

    async update(casher: Casher, updateData: Partial<CasherInterface>): Promise<Casher> {
        try {
            Object.assign(casher, updateData);
            return await this.casherRepository.save(casher);
        } catch (error) {
            console.error('Update error:', error);
            throw new Error('Failed to persist casher updates');
        }
    }

    async saveWithUser(casher): Promise<Casher> {
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
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteWithUser(casher): Promise<void> {
        const queryRunner = this.casherRepository.manager.connection.createQueryRunner();
        
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // First delete the company record
            await queryRunner.manager.delete(Casher, casher.id);
            
            // Then delete the associated user
            if (casher.user) {
                await queryRunner.manager.delete(User, casher.user.id);
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
        if (!CasherRepository.casherRepo) {
            CasherRepository.casherRepo = new CasherRepository();
        }
        return CasherRepository.casherRepo;
    }
}