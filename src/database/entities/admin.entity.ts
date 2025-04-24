import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Casher } from "./casher.entity";
import { SuperAdmin } from "./company.entity";
import { PermissionStatus } from "../anum/permission.enum";
import { AdminInterface } from "../type/admin/admin.interface";
import { User } from "./user.entity";

@Entity("admin")
export class Admin implements AdminInterface{
@PrimaryGeneratedColumn("uuid")
id:string;
@Column({type:"enum", enum: PermissionStatus,default:PermissionStatus.Pemitted})
status: PermissionStatus;
@Column({type:"decimal",precision:30,scale:2})
total_earning:number
@Column({type:"decimal",precision:30,scale:2})
net_earning:number
@Column({type:"decimal",precision:30,scale:2})
package:number;
@OneToOne(() => User, user => user.admin)
@JoinColumn()
user: User;
@OneToMany(() => Casher, casher => casher.admin)
@JoinColumn()
 cashers: Casher[];
@ManyToOne(()=>SuperAdmin,super_admin=>super_admin.admin)
@JoinColumn({name:"super_id"})
company:SuperAdmin;
@Column({nullable:true})
super_id:string;
@CreateDateColumn()
created_at:Date;
}