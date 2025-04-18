import {  Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { PermissionStatus } from "../anum/permission.enum";
import { CasherInterface } from "../type/casher/casher.interface";
import { User } from "./user.entity";
import { Admin } from "./admin.entity";
import { Game } from "./game.entity";
@Entity("casher")
export class Casher implements CasherInterface {
    @PrimaryGeneratedColumn("uuid")
    id:string;
    @Column({type:"enum",enum:PermissionStatus,default:PermissionStatus.Pemitted})
    status:string;
    @OneToMany(()=>Admin,admin=>admin.cashers)
    @JoinColumn({name:"admin_id"})
    admin:Admin;
    @OneToMany(()=>Game,game=>game.casher)
    game?:Game[];
    @Column()
    admin_id:string;
   @CreateDateColumn()
   created_at:Date
}