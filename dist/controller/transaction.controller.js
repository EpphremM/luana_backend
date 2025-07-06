"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crteateTransaction = exports.deleteTransaction = exports.updateTransaction = exports.getTransactionById = exports.getTransactionsByUserId = exports.getAllTransactions = exports.createTransaction = void 0;
const zod_validation_1 = require("../zod/middleware/zod.validation");
const transaction_repository_1 = require("../database/repositories/transaction.repository");
const app_error_1 = require("../express/error/app.error");
const response_body_1 = require("../express/types/response.body");
const transaction_schema_1 = require("../zod/schemas/transaction.schema");
const user_repository_1 = require("../database/repositories/user.repository");
const createTransaction = async (req, res, next) => {
    try {
        const validationStatus = await (0, zod_validation_1.validateInput)(transaction_schema_1.transactionSchema, req.body);
        if (validationStatus.status !== "success") {
            console.log(validationStatus.errors);
            return next(new app_error_1.AppError("Invalid transaction data", 400));
        }
        const newTransaction = await transaction_repository_1.TransactionRepository.getRepo().register(req.body);
        res.status(201).json((0, response_body_1.createResponse)("success", "Transaction created successfully", newTransaction));
    }
    catch (error) {
        next(new app_error_1.AppError("Error creating transaction", 500, "Operational", error));
    }
};
exports.createTransaction = createTransaction;
const getAllTransactions = async (req, res, next) => {
    try {
        const pagination = req.query;
        const transactions = await transaction_repository_1.TransactionRepository.getRepo().find(pagination);
        res.status(200).json((0, response_body_1.createResponse)("success", "Transactions fetched successfully", transactions));
    }
    catch (error) {
        next(new app_error_1.AppError("Error fetching transactions", 500, "Operational", error));
    }
};
exports.getAllTransactions = getAllTransactions;
const getTransactionsByUserId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await user_repository_1.UserRepository.getRepo().findById(id);
        if (!user) {
            return next(new app_error_1.AppError("User not found", 400));
        }
        const pagination = req.query;
        const transactions = await transaction_repository_1.TransactionRepository.getRepo().findByUserId(id, pagination);
        res.status(200).json((0, response_body_1.createResponse)("success", "User transactions fetched successfully", transactions));
    }
    catch (error) {
        console.log;
        next(new app_error_1.AppError("Error fetching user transactions", 500, "Operational", error));
    }
};
exports.getTransactionsByUserId = getTransactionsByUserId;
const getTransactionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const transaction = await transaction_repository_1.TransactionRepository.getRepo().findById(id);
        if (!transaction) {
            return next(new app_error_1.AppError("Transaction not found", 404, "Operational"));
        }
        res.status(200).json((0, response_body_1.createResponse)("success", "Transaction fetched successfully", transaction));
    }
    catch (error) {
        next(new app_error_1.AppError("Error fetching transaction", 500, "Operational", error));
    }
};
exports.getTransactionById = getTransactionById;
const updateTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validationStatus = await (0, zod_validation_1.validateInput)(transaction_schema_1.updateTransactionSchema, req.body);
        if (validationStatus.status !== "success") {
            return next(new app_error_1.AppError("Invalid transaction update data", 400));
        }
        const existingTransaction = await transaction_repository_1.TransactionRepository.getRepo().findById(id);
        if (!existingTransaction) {
            return next(new app_error_1.AppError("Transaction not found", 404, "Operational"));
        }
        const updatedTransaction = await transaction_repository_1.TransactionRepository.getRepo().update(existingTransaction, req.body);
        res.status(200).json((0, response_body_1.createResponse)("success", "Transaction updated successfully", updatedTransaction));
    }
    catch (error) {
        next(new app_error_1.AppError("Error updating transaction", 500, "Operational", error));
    }
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const transaction = await transaction_repository_1.TransactionRepository.getRepo().findById(id);
        if (!transaction) {
            return next(new app_error_1.AppError("Transaction not found", 404, "Operational"));
        }
        await transaction_repository_1.TransactionRepository.getRepo().delete(id);
        res.status(200).json((0, response_body_1.createResponse)("success", "Transaction deleted successfully", null));
    }
    catch (error) {
        next(new app_error_1.AppError("Error deleting transaction", 500, "Operational", error));
    }
};
exports.deleteTransaction = deleteTransaction;
const crteateTransaction = async (body) => {
    try {
        const validationStatus = await (0, zod_validation_1.validateInput)(transaction_schema_1.transactionSchema, body);
        if (validationStatus.status !== "success") {
            console.log(validationStatus.errors);
            return (new app_error_1.AppError("Invalid transaction data", 400));
        }
        const newTransaction = await transaction_repository_1.TransactionRepository.getRepo().registerForTopUp(body);
        return newTransaction;
    }
    catch (error) {
        console.log("Error occured during creating transaction", error);
    }
};
exports.crteateTransaction = crteateTransaction;
