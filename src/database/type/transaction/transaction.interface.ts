import { User } from "../../entities/user.entity";
import { transactionStatus, transactionType } from "../../enum/transaction.type.enum";

export interface TransactionInterface{
    id:string,
    type:string,
    status:string,
    amount_in_birr:number,
    amount_in_package:number;
    sender_id:string;
    sender:User,
    reciever:User,
    reciever_id?:string,
    created_at:Date
}
export interface TransactionCreateDto {
  type: string;
  amount_in_birr: number;
  amount_in_package: number;
  status: string;
  sender_id: string;
  reciever_id: string;
}
