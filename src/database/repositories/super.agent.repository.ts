import { AppDataSource } from "../data.source";
import { User } from "../entities/user.entity";
import { SuperAgentInterface } from "../type/super_agent/super.agent.interface";
import { PaginationDto } from "../../DTO/pagination.dto";
import { SuperAgent } from "../entities/agent.entity";
import { AppError } from "../../express/error/app.error";


export class SuperAgentRepository {
  superAgentRepository = AppDataSource.getRepository<SuperAgentInterface>(SuperAgent);
  static instance: SuperAgentRepository | null = null;

  private constructor() {}

  createObject(agent) {
    return this.superAgentRepository.create(agent);
  }

  async register(agent) {
    return await this.superAgentRepository.save(agent);
  }

 async findSuperAgentSalesReport(
  pagination: PaginationDto,
  filters: {
    super_agent_id: string;
    start_date?: string;
    end_date?: string;
  }
) {
  const { page = 1, limit = 10 } = pagination;
  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.min(100, Math.max(1, Number(limit)));
  const skip = (parsedPage - 1) * parsedLimit;

  const { super_agent_id, start_date, end_date } = filters;
  if (!super_agent_id) throw new AppError("super_agent_id is required", 400);

  let start = start_date ? new Date(start_date) : new Date();
  let end = end_date ? new Date(end_date) : new Date();
  if (!start_date && !end_date) {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  const superAgent = await SuperAgentRepository.getRepo().findById(super_agent_id);
  if (!superAgent) throw new AppError("Super Agent not found", 404);

  const adminAggregates = superAgent.admins.map((admin) => {
    let totalSales = 0;
    let totalAdminEarnings = 0;
    let totalCompanyEarnings = 0;
    let totalGames = 0;
    let totalPlayerBets = 0;

    admin.cashers?.forEach((casher) => {
      casher.game?.forEach((game) => {
        const createdAt = new Date(game.created_at);
        if (
          game.status === "completed" &&
          createdAt >= start &&
          createdAt <= end
        ) {
          const derash = Number(game.derash ?? 0);
          const playerBet = Number(game.player_bet ?? 0);
          const totalPlayers = Number(game.total_player ?? 0);
          const playerTotalBet = playerBet * totalPlayers;

          totalSales += derash;
          totalAdminEarnings += Number(game.admin_price ?? 0);
          totalCompanyEarnings += Number(game.company_comission ?? 0);
          totalPlayerBets += playerTotalBet;
          totalGames++;
        }
      });
    });

    return {
      admin_id: admin.id,
      firstName: admin.user?.first_name ?? "",
      lastName: admin.user?.last_name ?? "",
      fee_percentage:admin.fee_percentage,
      totalSales,
      totalPlayerBets,
      totalCut: totalPlayerBets - totalSales,
      totalAdminEarnings,
      totalCompanyEarnings,
      totalGames,
    };
  });

  const sortedAdmins = adminAggregates.sort((a, b) => b.totalSales - a.totalSales);
  const paginated = sortedAdmins.slice(skip, skip + parsedLimit);

  const overallSummary = sortedAdmins.reduce(
    (acc, cur) => {
      acc.totalSales += cur.totalSales;
      acc.totalPlayerBets += cur.totalPlayerBets;
      acc.totalCut += cur.totalCut;
      acc.totalAdminEarnings += cur.totalAdminEarnings;
      acc.totalCompanyEarnings += cur.totalCompanyEarnings;
      acc.totalGames += cur.totalGames;
      return acc;
    },
    {
      totalSales: 0,
      totalPlayerBets: 0,
      totalCut: 0,
      totalAdminEarnings: 0,
      totalCompanyEarnings: 0,
      totalGames: 0,
    }
  );

  const totalPages = Math.ceil(sortedAdmins.length / parsedLimit);

  return {
    status: "success",
    message: "Super agent sales summary retrieved",
    data: {
      payload: {
        per_admin: paginated,
        overall_summary: overallSummary,
        pagination: {
          totalItems: sortedAdmins.length,
          itemCount: paginated.length,
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



  async smallUpdate(id: string, updatedData: Partial<SuperAgentInterface>) {
    await this.superAgentRepository.update(id, updatedData);
    return await this.superAgentRepository.findOneBy({ id });
  }

  async findAll() {
    return await this.superAgentRepository.find({
      relations: ["user", "company","admins","admins.cashers","admins.cartela"]
    });
  }

  async find(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.min(100, Math.max(1, Number(limit)));
    const skip = (parsedPage - 1) * parsedLimit;

const query = this.superAgentRepository.createQueryBuilder("super_agent")
  .leftJoinAndSelect("super_agent.user", "user")
  .leftJoinAndSelect("super_agent.admins", "admin")
  .leftJoinAndSelect("admin.cashers", "casher")
  .leftJoinAndSelect("admin.cartela", "cartela")
  .leftJoinAndSelect("super_agent.company", "company");


    const [agents, total] = await query.take(parsedLimit).skip(skip).getManyAndCount();
    const totalPages = Math.ceil(total / parsedLimit);

    return {
      data: agents,
      pagination: {
        totalItems: total,
        itemCount: agents.length,
        itemsPerPage: parsedLimit,
        totalPages,
        currentPage: parsedPage,
        hasNextPage: parsedPage < totalPages,
        hasPreviousPage: parsedPage > 1,
      }
    };
  }

 async findById(id: string) {
  return await this.superAgentRepository.findOne({
    where: { id },
    relations: [
      "user",
      "company",
      "admins",
      "admins.cashers",
      "admins.cartela",
      "admins.cashers.game",
      "admins.user",
    ],
  });
}


  async delete(id: string) {
    return this.superAgentRepository.delete(id);
  }

  async update(agent, updateData: Partial<SuperAgentInterface>): Promise<SuperAgent> {
    try {
      Object.assign(agent, updateData);

      if (updateData.user) {
        Object.assign(agent.user, updateData.user);
      }

      return await this.superAgentRepository.save(agent);
    } catch (error) {
      console.error("Update error:", error);
      throw new Error("Failed to persist super agent updates");
    }
  }

  async saveWithUser(agent): Promise<SuperAgent> {
    const queryRunner = this.superAgentRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (agent.user) {
        await queryRunner.manager.save(agent.user);
      }

      const result = await queryRunner.manager.save(agent);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteWithUser(agent): Promise<void> {
    const queryRunner = this.superAgentRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(SuperAgent, agent.id);

      if (agent.user) {
        await queryRunner.manager.delete(User, agent.user.id);
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
    if (!SuperAgentRepository.instance)
      SuperAgentRepository.instance = new SuperAgentRepository();
    return SuperAgentRepository.instance;
  }
}
