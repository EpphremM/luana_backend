import { Admin } from "../../entities/admin.entity";
import { Casher } from "../../entities/casher.entity";
import { Game } from "../../entities/game.entity";
import { User } from "../../entities/user.entity";


export interface CasherInterface{
    id:string;
    status:string;
    created_at:Date
    admin?:Admin,
    game?:Game[],
    admin_id?:string;
    user?:User;
    casher?:Casher[];


}