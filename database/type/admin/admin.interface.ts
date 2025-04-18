import { Casher } from "../../entities/casher.entity";
import { Game } from "../../entities/game.entity";
import { User } from "../../entities/user.entity";
import { UserInterface } from "../user/user.interface";

export interface AdminInterface {
    id?: string;
    package: number;
    total_earning: number;
    net_earning: number;
    wallet:number;
    status:string;
    user?:User;
    cashers?:Casher[];
}