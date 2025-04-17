import {  Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { PermissionStatus } from "../anum/permission.enum";
import { CasherInterface } from "../type/casher/casher.interface";
import { User } from "./user.entity";
import { Admin } from "./admin.entity";
import { Game } from "./game.entity";
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
    @OneToMany(()=>Game,game=>game.casher)
    game:Game[];
   @Column()
   created_at:Date
}