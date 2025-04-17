import { AdminInterface } from "../admin/admin.interface";
import { CasherInterface } from "../casher/casher.interface";
import { SuperInterface } from "../super_admin/super.admin.interface";

export interface UserInterface{
    id?:string;
    first_name:string;
    last_name:string;
    username:string;
    password:string;
    role:string;
    status?:string;
    package?: number;
    total_earning?: number;
    net_earning?: number;
    wallet?:number;
    casher?:CasherInterface;
    admin?:AdminInterface;
    super_admin?:SuperInterface;
}