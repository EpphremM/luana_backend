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
}