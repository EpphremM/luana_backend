import { AppDataSource } from "../data.source";
import { User } from "../entities/user.entity";
import { UserInterface } from "../type/user/user.interface";

export class UserRepository{
    userRepository=AppDataSource.getRepository<UserInterface>(User)
    static userRepo:UserRepository|null=null;
    private constructor(){}
    async register(user:UserInterface){
        return await this.userRepository.save(user);
    }

    createObject(user: UserInterface) {
        return  this.userRepository.create(user)
    }
 async find() {
        return await this.userRepository.createQueryBuilder("user").leftJoinAndSelect("casher.game", "game").leftJoinAndSelect("company.admin","admin").getMany();
    }
    async findById(id:string){
return await this.userRepository.find({where:{id},relations:["company","casher","admin"]});
    }
    async findByUsername(username:string){
        return await this.userRepository.findOne({where:{username}})
    }
    async Delete(id:string){
        return this.userRepository.delete(id);
    }
    async update(id:string,newAdmin:Partial<UserInterface>){
await this.userRepository.update(id,newAdmin);
return await this.userRepository.findOneBy({id});
    }

    static getRepo(){
        if(!UserRepository.userRepo)
            UserRepository.userRepo=new UserRepository();
        return UserRepository.userRepo;
    }
}