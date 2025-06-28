import { AppDataSource } from "../data.source";
import { User } from "../entities/user.entity";
import { SuperAgentInterface } from "../type/super_agent/super.agent.interface";
import { PaginationDto } from "../../DTO/pagination.dto";
import { SuperAgent } from "../entities/agent.entity";


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

  async smallUpdate(id: string, updatedData: Partial<SuperAgentInterface>) {
    await this.superAgentRepository.update(id, updatedData);
    return await this.superAgentRepository.findOneBy({ id });
  }

  async findAll() {
    return await this.superAgentRepository.find({
      relations: ["user", "company"]
    });
  }

  async find(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.min(100, Math.max(1, Number(limit)));
    const skip = (parsedPage - 1) * parsedLimit;

    const query = this.superAgentRepository.createQueryBuilder("super_agent")
      .leftJoinAndSelect("super_agent.user", "user")
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
      relations: ["user", "company"]
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
