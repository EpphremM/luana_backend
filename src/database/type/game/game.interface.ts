import { Admin } from "../../entities/admin.entity";
import { Casher } from "../../entities/casher.entity";

export class GameInterface{
    id:string;
    name:string;
    player_bet:number;
    total_calls:number;
    winner_cards:number[]
    total_player:number;
    status:string;
    derash:number;
    company_comission:number;
    created_at:Date;
    casher_id?:string;
    casher?:Casher;
    admin_price:number;
}