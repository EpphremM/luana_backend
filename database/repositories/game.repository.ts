import { AppDataSource } from "../data.source";
import { Game } from "../entities/game.entity";
import { GameInterface } from "../type/game/game.interface";

export class GameRepository{
gameRepository=AppDataSource.getRepository<GameInterface>(Game);
static gameRepo:GameRepository|null=null;
private constructor(){}
async register(game){
    return await this.gameRepository.save(game);
}
async find(){
    return await this.gameRepository.find({relations:[]})
}
async findById(id:string){
    return await this.gameRepository.findOne({where:{id},relations:[]})
}
async delete(id:string){
    return await this.gameRepository.delete(id)
}

    async update(game: Game, updateData: Partial<GameInterface>): Promise<Game> {
        try {
            Object.assign(game, updateData);
            return await this.gameRepository.save(game);
        } catch (error) {
            console.error('Update error:', error);
            throw new Error('Failed to persist game updates');
        }
    }
static gerRepo(){
    if(!GameRepository.gameRepo){
        GameRepository.gameRepo=new GameRepository();
    }
    return GameRepository;
}
}