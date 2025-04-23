import { AppError } from "../../express/error/app.error";
import { AppDataSource } from "../data.source";
import { Admin } from "../entities/admin.entity";
import { User } from "../entities/user.entity";
import { AdminInterface } from "../type/admin/admin.interface";
import { UserInterface } from "../type/user/user.interface";

export class AdminRepository {
    adminRepository = AppDataSource.getRepository<AdminInterface>(Admin)
    static userRepo: AdminRepository | null = null;
    private constructor() { }

    createObject(admin) {
        return this.adminRepository.create(admin)
    }
    async register(user) {
        return await this.adminRepository.save(user);
    }
    async find() {
        return await this.adminRepository.find({relations:["user","cashers","company"]});
    }
    
    async findById(id: string) {
          const admin = await this.adminRepository.findOne({
            where: { id },
            relations: ["user","cashers","cashers.user"], 
          });
          return admin;
      }
      
    async Delete(id:string){
        return this.adminRepository.delete(id);
    }
    async update(admin: Admin, updateData: Partial<UserInterface>): Promise<Admin> {
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
        } catch (error) {
            console.error('Update error:', error);
            throw new Error('Failed to persist admin updates');
        }
    }
    async saveWithUser(admin): Promise<Admin> {
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
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      }
      async deleteWithUser(admin): Promise<void> {
        const queryRunner = this.adminRepository.manager.connection.createQueryRunner();
        
        await queryRunner.connect();
        await queryRunner.startTransaction();
      
        try {
          // 1. First delete the admin record
          await queryRunner.manager.delete(Admin, admin.id);
          
          // 2. Then delete the associated user
          if (admin.user) {
            await queryRunner.manager.delete(User, admin.user.id);
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
        if (!AdminRepository.userRepo)
            AdminRepository.userRepo = new AdminRepository();
        return AdminRepository.userRepo;
    }
}