"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRepository = void 0;
const app_error_1 = require("../../express/error/app.error");
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
        const { page = 1, limit = 10 } = pagination;
        const query = this.gameRepository.createQueryBuilder('game').where({ casher_id: casher_id });
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
    async findAdminSales(pagination, filters = {}) {
        const { page = 1, limit = 10 } = pagination;
        const parsedPage = Math.max(1, Number(page));
        const parsedLimit = Math.min(100, Math.max(1, Number(limit)));
        const skip = (parsedPage - 1) * parsedLimit;
        const { admin_id, casher_id, start_date, end_date } = filters;
        if (!admin_id && !casher_id) {
            throw new app_error_1.AppError("You must provide either admin_id or casher_id to filter sales.", 400);
        }
        const baseWhereQ = (query, forSummary = false) => {
            if (admin_id) {
                query.andWhere("admin.id = :admin_id", { admin_id });
            }
            if (casher_id) {
                query.andWhere("casher.id = :casher_id", { casher_id });
            }
            if (start_date && end_date) {
                query.andWhere("game.created_at BETWEEN :start AND :end", {
                    start: new Date(start_date),
                    end: new Date(end_date),
                });
            }
            else if (start_date) {
                query.andWhere("game.created_at >= :start_date", { start_date: new Date(start_date) });
            }
            else if (end_date) {
                query.andWhere("game.created_at <= :end_date", { end_date: new Date(end_date) });
            }
            else {
                const now = new Date();
                const startOfToday = new Date(now.setHours(0, 0, 0, 0));
                const endOfToday = new Date(now.setHours(23, 59, 59, 999));
                query.andWhere("game.created_at BETWEEN :start AND :end", {
                    start: startOfToday,
                    end: endOfToday,
                });
            }
            if (forSummary) {
                query.andWhere("game.status = :status", { status: "completed" });
            }
            return query;
        };
        const gameQ = baseWhereQ(this.gameRepository
            .createQueryBuilder("game")
            .leftJoin("game.casher", "casher")
            .leftJoin("casher.admin", "admin")
            .orderBy("game.created_at", "DESC")
            .skip(skip)
            .take(parsedLimit));
        const [games, total] = await gameQ.getManyAndCount();
        // ===== 3. Summary data (only completed games, no pagination) =====
        const summaryQ = baseWhereQ(this.gameRepository
            .createQueryBuilder("game")
            .leftJoin("game.casher", "casher")
            .leftJoin("casher.admin", "admin"), true // summary flag enables status = completed
        );
        const completedGames = await summaryQ.getMany();
        // ===== 4. Summary calculation =====
        let totalSales = 0;
        let totalAdminEarnings = 0;
        let totalCompanyEarnings = 0;
        let totalGames = 0;
        let totalPlayerBets = 0;
        completedGames.forEach((game) => {
            const derash = Number(game.derash ?? 0);
            const admin_price = Number(game.admin_price ?? 0);
            const company_comission = Number(game.company_comission ?? 0);
            const playerBet = Number(game.player_bet ?? 0);
            const totalPlayers = Number(game.total_player ?? 0);
            const bet = playerBet * totalPlayers;
            totalSales += derash;
            totalAdminEarnings += admin_price;
            totalCompanyEarnings += company_comission;
            totalPlayerBets += bet;
            totalGames++;
        });
        const totalPages = Math.ceil(total / parsedLimit);
        return {
            status: "success",
            message: "Sales data retrieved successfully",
            data: {
                payload: {
                    data: games,
                    summary: {
                        totalSales,
                        totalAdminEarnings,
                        totalCompanyEarnings,
                        totalPlayerBets,
                        totalCut: totalPlayerBets - totalSales,
                        totalGames,
                    },
                    pagination: {
                        totalItems: total,
                        itemCount: games.length,
                        itemsPerPage: parsedLimit,
                        totalPages,
                        currentPage: parsedPage,
                        hasNextPage: parsedPage < totalPages,
                        hasPreviousPage: parsedPage > 1,
                    },
                },
            },
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
