import { User } from "../../entities/user.entity";

export interface SuperInterface{
    id:string;
    net_earning:number;
    fee_percentage:number
    user?:User
}