import {  Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
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
    @OneToMany(()=>Admin,admin=>admin.casher)
    @JoinColumn({name:"admin_id"})
    admin:Admin;
    @ManyToOne(()=>Game,game=>game.casher)
    game:Game[];
    @Column()
    admin_id:string;
   @Column()
   created_at:Date
}