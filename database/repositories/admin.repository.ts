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
        return await this.adminRepository.find({relations:["user"]});
    }
    
    async findById(id:string){
return await this.adminRepository.find({where:{id},relations:["company","casher","casher.game"]});
    }
    async Delete(id:string){
        return this.adminRepository.delete(id);
    }
    async update(id:string,newAdmin){
await this.adminRepository.update(id,newAdmin);
return await this.adminRepository.findOneBy({id});
    }
    static getRepo() {
        if (!AdminRepository.userRepo)
            AdminRepository.userRepo = new AdminRepository();
        return AdminRepository.userRepo;
    }
}