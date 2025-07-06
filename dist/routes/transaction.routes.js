"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRoutes = void 0;
const express_1 = require("express");
const transaction_controller_1 = require("../controller/transaction.controller");
class TransactionRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setRoutes(this.router);
    }
    setRoutes(router) {
        router.route("/").post(transaction_controller_1.createTransaction).get(transaction_controller_1.getAllTransactions);
        router.route("/:id").get(transaction_controller_1.getTransactionById).delete(transaction_controller_1.deleteTransaction).patch(transaction_controller_1.updateTransaction);
        router.route("/user/:id").get(transaction_controller_1.getTransactionsByUserId);
    }
}
exports.TransactionRoutes = TransactionRoutes;
