import { AppDataSource } from "../data.source";
import { Card } from "../entities/card.entity";
import { CardInterface } from "../type/card/card.interface";
export class CardRepository{
    cardRepository=AppDataSource.getRepository<CardInterface>(Card)
    static cardRepo:CardRepository|null=null;
    private constructor(){}
    async register(cardBody:CardInterface){
        console.log("Hello from registeration of card");
        const card= this.cardRepository.create(cardBody)
        console.log(card);
        return await this.cardRepository.save(card);
    }

    createObject(card: CardInterface) {
        return  this.cardRepository.create(card)
    }
 async find() {
        return await this.cardRepository.find({relations:[]});
    }
    async findById(id:string){
return await this.cardRepository.find({where:{id},relations:[]});
    }
    async Delete(id:string){
        return this.cardRepository.delete(id);
    }
    async update(id:string,newAdmin:Partial<CardInterface>){
await this.cardRepository.update(id,newAdmin);
return await this.cardRepository.findOneBy({id});
    }

    static getRepo(){
        if(!CardRepository.cardRepo)
            CardRepository.cardRepo=new CardRepository();
        return CardRepository.cardRepo;
    }
}