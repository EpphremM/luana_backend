import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Casher } from "./casher.entity";
import { SuperAdmin } from "./company.entity";
import { PermissionStatus } from "../anum/permission.enum";
import { AdminInterface } from "../type/admin/admin.interface";

@Entity("admin")
export class Admin implements AdminInterface{
@PrimaryGeneratedColumn("uuid")
id:string;
@OneToOne(()=>User,user=>user.admin)
user:User;
@Column({type:"enum",enum:PermissionStatus})
status:PermissionState;
@Column()
wallet:number;
@Column({type:"decimal",precision:30,scale:2})
total_earning:number
@Column({type:"decimal",precision:30,scale:2})
net_earning:number
@Column({type:"decimal",precision:30,scale:2})
package:number;
@OneToMany(()=>Casher,casher=>casher.admin)
casher:Casher[];
@ManyToOne(()=>SuperAdmin,super_admin=>super_admin.admin)
company:SuperAdmin;
@Column()
created_at:Date;
}