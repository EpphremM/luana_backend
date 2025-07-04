import { Router } from "express";
import { createTransaction, deleteTransaction, getAllTransactions, getTransactionById, getTransactionsByUserId, updateTransaction } from "../controller/transaction.controller";

export class TransactionRoutes{
    public router:Router;
    constructor(){
        this.router=Router();
        this.setRoutes(this.router);
    }
    private setRoutes(router:Router){
router.route("/").post(createTransaction).get(getAllTransactions);
router.route("/:id").get(getTransactionById).delete(deleteTransaction).patch(updateTransaction);
router.route("/user/:id").get(getTransactionsByUserId);
    }
}