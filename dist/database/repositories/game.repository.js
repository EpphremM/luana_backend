"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRepository = void 0;
const data_source_1 = require("../data.source");
const game_entity_1 = require("../entities/game.entity");
class GameRepository {
    constructor() {
        this.gameRepository = data_source_1.AppDataSource.getRepository(game_entity_1.Game);
    }
    async register(game) {
        return await this.gameRepository.save(game);
    }
    async findGameByCasherId(casher_id, pagination) {
        // const casher= await CasherRepository.getRepo().findById(casher_id);
        const { page = 1, limit = 10 } = pagination;
        const query = this.gameRepository.createQueryBuilder('game').where({ casher_id: casher_id });
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
    async find(pagination) {
        const { page = 1, limit = 10 } = pagination;
        const parsedPage = Math.max(1, Number(page));
        const parsedLimit = Number(Math.min(100, Math.max(1, Number(limit))));
        const skip = (parsedPage - 1) * parsedLimit;
        const query = this.gameRepository.createQueryBuilder('game')
            .leftJoinAndSelect('game.casher', 'casher');
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
    async findById(id) {
        return await this.gameRepository.findOne({ where: { id }, relations: [] });
    }
    async delete(id) {
        return await this.gameRepository.delete(id);
    }
    async findByCashierId(id) {
        return this.gameRepository.createQueryBuilder('game').where({ casher_id: id }).leftJoinAndSelect('game.casher', 'casher').getManyAndCount();
    }
    async update(game, updateData) {
        try {
            Object.assign(game, updateData);
            return await this.gameRepository.save(game);
        }
        catch (error) {
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
exports.GameRepository = GameRepository;
GameRepository.gameRepo = null;
