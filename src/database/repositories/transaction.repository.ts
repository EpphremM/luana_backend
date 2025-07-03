import { AppDataSource } from "../data.source";
import { Transaction } from "../entities/transaction.entity";
import { PaginationDto } from "../../DTO/pagination.dto";
import { TransactionCreateDto, TransactionInterface } from "../type/transaction/transaction.interface";

export class TransactionRepository {
  transactionRepository = AppDataSource.getRepository<TransactionInterface>(Transaction);
  static transactionRepo: TransactionRepository | null = null;

  private constructor() {}
  async register(transaction: TransactionInterface) {
    return await this.transactionRepository.save(transaction);
  }
  async registerForTopUp(transaction: TransactionCreateDto) {
    return await this.transactionRepository.save(transaction);
  }
  async find(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.min(100, Math.max(1, Number(limit)));
    const skip = (parsedPage - 1) * parsedLimit;

    const query = this.transactionRepository.createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.sender", "senderUser").leftJoinAndSelect("transaction.reciever","reciverUser");

    const [transactions, total] = await query.take(parsedLimit).skip(skip).getManyAndCount();
    const totalPages = Math.ceil(total / parsedLimit);

    return {
      data: transactions,
      pagination: {
        totalItems: total,
        itemCount: transactions.length,
        itemsPerPage: parsedLimit,
        totalPages,
        currentPage: parsedPage,
        hasNextPage: parsedPage < totalPages,
        hasPreviousPage: parsedPage > 1,
      }
    };
  }
  async findByUserId(user_id: string, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const parsedPage = Math.max(1, Number(page));
    const parsedLimit = Math.min(100, Math.max(1, Number(limit)));
    const skip = (parsedPage - 1) * parsedLimit;

    const query = this.transactionRepository.createQueryBuilder("transaction")
      .where({ user_id })
      .leftJoinAndSelect("transaction.sender", "senderUser").leftJoinAndSelect("transaction.sender","recieverUser");

    const [transactions, total] = await query.take(parsedLimit).skip(skip).getManyAndCount();
    const totalPages = Math.ceil(total / parsedLimit);

    return {
      data: transactions,
      pagination: {
        totalItems: total,
        itemCount: transactions.length,
        itemsPerPage: parsedLimit,
        totalPages,
        currentPage: parsedPage,
        hasNextPage: parsedPage < totalPages,
        hasPreviousPage: parsedPage > 1,
      }
    };
  }

  async findById(id: string) {
    return await this.transactionRepository.findOne({
      where: { id },
      relations: ["user"]
    });
  }

  async delete(id: string) {
    return await this.transactionRepository.delete(id);
  }
  async update(transaction: Transaction, updateData: Partial<TransactionInterface>) {
    try {
      Object.assign(transaction, updateData);
      return await this.transactionRepository.save(transaction);
    } catch (error) {
      console.error("Update error:", error);
      throw new Error("Failed to persist transaction updates");
    }
  }

  static getRepo() {
    if (!TransactionRepository.transactionRepo) {
      TransactionRepository.transactionRepo = new TransactionRepository();
    }
    return TransactionRepository.transactionRepo;
  }
}
