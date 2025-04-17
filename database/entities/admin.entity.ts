import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("admin")
export class Admin{
@PrimaryGeneratedColumn("uuid")
id:string;
@OneToOne(()=>User,user=>user.admin)
user:User;
@Column({type:"enum",enum:PermissionStatus})
status:PermissionState;
}