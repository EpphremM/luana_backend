import {  Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { PermissionStatus } from "../anum/permission.enum";
import { CasherInterface } from "../type/casher/casher.interface";
import { User } from "./user.entity";
import { Admin } from "./admin.entity";
import { Game } from "./game.entity";
import { DailyStat } from "./daily.aggregation.entity";
import { MonthlyStat } from "./monthly.aggregation.entity";
import { YearlyStat } from "./yearly.aggregation.entity";
@Entity("casher")
export class Casher implements CasherInterface {
    @PrimaryColumn("uuid")
    id:string;
    @Column({type:"enum",enum:PermissionStatus})
    status:PermissionStatus;
    @OneToOne(()=>User,user=>user.casher)
    user:User[];
    @OneToMany(()=>Admin,admin=>admin.casher)
    admin:Admin;
    @ManyToOne(()=>Game,game=>game.casher)
    @JoinColumn({name:"admin_id"})
    game:Game[];
    @Column()
    admin_id:string;
    @OneToMany(()=>DailyStat,daily=>daily.casher)
    daily:DailyStat[];
    @OneToMany(()=>MonthlyStat,month=>month.casher)
    monthly:MonthlyStat;
    @OneToMany(()=>YearlyStat,year=>year.casher)
    yearly:YearlyStat;
   @Column()
   created_at:Date
}