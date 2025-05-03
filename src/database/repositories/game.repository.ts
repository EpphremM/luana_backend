import { PaginationDto } from "../../DTO/pagination.dto";
import { AppDataSource } from "../data.source";
import { Game } from "../entities/game.entity";
import { GameInterface } from "../type/game/game.interface";
import { CasherRepository } from "./casher.repository";

export class GameRepository{
gameRepository=AppDataSource.getRepository<GameInterface>(Game);
static gameRepo:GameRepository|null=null;
private constructor(){}
async register(game){
    return await this.gameRepository.save(game);
}
async findGameByCasherId(casher_id: string, pagination: PaginationDto) {
        // const casher= await CasherRepository.getRepo().findById(casher_id);

        const { page = 1, limit = 10 } = pagination;
        const query = await this.gameRepository.createQueryBuilder('game').where({ casher_id: casher_id });

        // return casher.game;
        const parsedPage = Math.max(1, Number(page));
        const parsedLimit = Number(Math.min(100, Math.max(1, Number(limit))));
        const skip = (parsedPage - 1) * parsedLimit;
        const [games, total] = await query
            .take(Number(parsedLimit))
            .skip(skip)
            .getManyAndCount();
        const totalPages = Math.ceil(total / parsedLimit);

        return {
            data: games,
            pagination: {
                totalItems: total,
                itemCount: games.length,
                itemsPerPage: parsedLimit,
                totalPages,
                currentPage: parsedPage,
                hasNextPage: parsedPage < totalPages,
                hasPreviousPage: parsedPage > 1,
            }
        };
    }

async find(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Number(Math.min(100, Math.max(1, Number(limit))));
    const skip = (parsedPage - 1) * parsedLimit;
    const query = this.gameRepository.createQueryBuilder('game')
      .leftJoinAndSelect('game.casher', 'casher')
    const [games, total] = await query
      .take(Number(parsedLimit))
      .skip(skip)
      .getManyAndCount();
  
    // Calculate total pages
    const totalPages = Math.ceil(total / parsedLimit);
  
    return {
      data: games,
      pagination: {
        totalItems: total,
        itemCount: games.length,
        itemsPerPage: parsedLimit,
        totalPages,
        currentPage: parsedPage,
        hasNextPage: parsedPage < totalPages,
        hasPreviousPage: parsedPage > 1,
      }
    };
  }

  
async findById(id:string){
    return await this.gameRepository.findOne({where:{id},relations:[]})
}
async delete(id:string){
    return await this.gameRepository.delete(id)
}

    async update(game, updateData) {
        try {
            Object.assign(game, updateData);
            return await this.gameRepository.save(game);
        } catch (error) {
            console.error('Update error:', error);
            throw new Error('Failed to persist game updates');
        }
    }
    static getRepo() {
        if (!GameRepository.gameRepo) {
            GameRepository.gameRepo = new GameRepository();
        }
        return GameRepository.gameRepo;
    }
}