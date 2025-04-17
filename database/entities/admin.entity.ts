import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Casher } from "./casher.entity";
import { SuperAdmin } from "./company.entity";
import { PermissionStatus } from "../anum/permission.enum";

@Entity("admin")
export class Admin{
@PrimaryGeneratedColumn("uuid")
id:string;
@OneToOne(()=>User,user=>user.admin)
user:User;
@OneToMany(()=>Casher,casher=>casher.admin)
casher:Casher[];
@ManyToOne(()=>SuperAdmin,super_admin=>super_admin.admin)
company:SuperAdmin;
@Column({type:"enum",enum:PermissionStatus})
status:PermissionState;
@Column()
created_at:Date;
}