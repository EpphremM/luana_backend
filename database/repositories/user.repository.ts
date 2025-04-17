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
    static getRepo(){
        if(!UserRepository.userRepo)
            UserRepository.userRepo=new UserRepository();
        return UserRepository.userRepo;
    }
}