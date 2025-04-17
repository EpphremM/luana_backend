import { Column, CreateDateColumn, Entity, OneToOne, PrimaryColumn } from "typeorm";
import { PermissionStatus } from "../anum/permission.enum";
import { CasherInterface } from "../type/casher/casher.interface";
import { User } from "./user.entity";
@Entity("casher")
export class Casher implements CasherInterface {
    @PrimaryColumn("uuid")
    id:string;
    @Column({type:"enum",enum:PermissionStatus})
    status:PermissionStatus;
    @OneToOne(()=>User,user=>user.casher)
    user:User;
   @Column()
   created_at:Date
}