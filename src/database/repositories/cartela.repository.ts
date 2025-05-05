import { AppDataSource } from "../data.source";
import { Cartela } from "../entities/cartela.entity";
import { CartelaInterface } from "../type/cartela/cartela.interface";
export class CartelaRepository{
    cartelaRepository=AppDataSource.getRepository<CartelaInterface>(Cartela)
    static cartelaRepo:CartelaRepository|null=null;
    private constructor(){}
    async register(cartelaBody:CartelaInterface){
        console.log("Hello from registeration of Cartela");
        const cartela= this.cartelaRepository.create(cartelaBody)
        console.log(cartela);
        return await this.cartelaRepository.save(cartela);
    }

    createObject(cartela: CartelaInterface) {
        return  this.cartelaRepository.create(cartela)
    }
 async find() {
        return await this.cartelaRepository.find({relations:["cards"]});
    }
    async findById(id:string){
return await this.cartelaRepository.find({where:{id},relations:["cards"]});
    }
    async findByname(name:string){
        return await this.cartelaRepository.findOne({where:{name}})
    }
    async Delete(id:string){
        return this.cartelaRepository.delete(id);
    }
    async update(id:string,newAdmin:Partial<CartelaInterface>){
await this.cartelaRepository.update(id,newAdmin);
return await this.cartelaRepository.findOneBy({id});
    }

    static getRepo(){
        if(!CartelaRepository.cartelaRepo)
            CartelaRepository.cartelaRepo=new CartelaRepository();
        return CartelaRepository.cartelaRepo;
    }
}