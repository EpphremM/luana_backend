import { Request, Response, NextFunction } from "express";
import { validateInput } from "../zod/middleware/zod.validation";
import { TransactionRepository } from "../database/repositories/transaction.repository";
import { AppError } from "../express/error/app.error";
import { createResponse } from "../express/types/response.body";
import { PaginationDto } from "../DTO/pagination.dto";
import { TransactionCreateDto, TransactionInterface } from "../database/type/transaction/transaction.interface";
import { transactionSchema, updateTransactionSchema } from "../zod/schemas/transaction.schema";
import { AdminRepository } from "../database/repositories/admin.repository";
import { SuperAgentRepository } from "../database/repositories/super.agent.repository";
import { CompanyRepository } from "../database/repositories/company.repository";
import { UserRepository } from "../database/repositories/user.repository";

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validationStatus = await validateInput<TransactionInterface>(transactionSchema, req.body);

        if (validationStatus.status !== "success") {
            console.log(validationStatus.errors);
            return next(new AppError("Invalid transaction data", 400));
        }

        const newTransaction = await TransactionRepository.getRepo().register(req.body);
        res.status(201).json(createResponse("success", "Transaction created successfully", newTransaction));
    } catch (error) {
        next(new AppError("Error creating transaction", 500, "Operational", error));
    }
};

export const getAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pagination: PaginationDto = req.query;

        const transactions = await TransactionRepository.getRepo().find(pagination);

        res.status(200).json(createResponse("success", "Transactions fetched successfully", transactions));
    } catch (error) {
        next(new AppError("Error fetching transactions", 500, "Operational", error));
    }
};

export const getTransactionsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user=await UserRepository.getRepo().findById(id);
        if(!user){
            return next(new AppError("User not found", 400));
        }
        const pagination: PaginationDto = req.query;
        const transactions = await TransactionRepository.getRepo().findByUserId(id, pagination);

        res.status(200).json(createResponse("success", "User transactions fetched successfully", transactions));
    } catch (error) {
        console.log
        next(new AppError("Error fetching user transactions", 500, "Operational", error));
    }
};

export const getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const transaction = await TransactionRepository.getRepo().findById(id);

        if (!transaction) {
            return next(new AppError("Transaction not found", 404, "Operational"));
        }

        res.status(200).json(createResponse("success", "Transaction fetched successfully", transaction));
    } catch (error) {
        next(new AppError("Error fetching transaction", 500, "Operational", error));
    }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validationStatus = await validateInput<Partial<TransactionInterface>>(updateTransactionSchema, req.body);

        if (validationStatus.status !== "success") {
            return next(new AppError("Invalid transaction update data", 400));
        }

        const existingTransaction = await TransactionRepository.getRepo().findById(id);
        if (!existingTransaction) {
            return next(new AppError("Transaction not found", 404, "Operational"));
        }

        const updatedTransaction = await TransactionRepository.getRepo().update(existingTransaction, req.body);
        res.status(200).json(createResponse("success", "Transaction updated successfully", updatedTransaction));
    } catch (error) {
        next(new AppError("Error updating transaction", 500, "Operational", error));
    }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const transaction = await TransactionRepository.getRepo().findById(id);

        if (!transaction) {
            return next(new AppError("Transaction not found", 404, "Operational"));
        }

        await TransactionRepository.getRepo().delete(id);
        res.status(200).json(createResponse("success", "Transaction deleted successfully", null));
    } catch (error) {
        next(new AppError("Error deleting transaction", 500, "Operational", error));
    }
};
export const crteateTransaction = async (body: TransactionCreateDto) => {
    try {
        const validationStatus = await validateInput<TransactionCreateDto>(transactionSchema, body);

        if (validationStatus.status !== "success") {
            console.log(validationStatus.errors);
            return (new AppError("Invalid transaction data", 400));
        }

        const newTransaction = await TransactionRepository.getRepo().registerForTopUp(body);
        return newTransaction;
    } catch (error) {
        console.log("Error occured during creating transaction", error);
    }
}

