import {  Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { PermissionStatus } from "../enum/permission.enum";
import { CasherInterface } from "../type/casher/casher.interface";
import { User } from "./user.entity";
import { Admin } from "./admin.entity";
import { Game } from "./game.entity";
@Entity("casher")
export class Casher implements CasherInterface {
    @PrimaryGeneratedColumn()
    id:string;
    @Column({type:"enum",enum:PermissionStatus,default:PermissionStatus.Pemitted})
    status:string;
    @ManyToOne(()=>Admin,admin=>admin.cashers,{cascade:true,onDelete:"CASCADE",onUpdate:"CASCADE"})
    @JoinColumn({name:"admin_id"})
    admin:Admin;
    @OneToMany(()=>Game,game=>game.casher)
    game?:Game[];
    @OneToOne(()=>User,user=>user.casher)
    @JoinColumn()
    user?:User
    @Column({nullable:true})
    admin_id?:string;
   @CreateDateColumn()
   created_at:Date
}