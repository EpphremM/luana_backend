import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Casher } from "./casher.entity";
import { SuperAdmin } from "./company.entity";
import { PermissionStatus } from "../enum/permission.enum";
import { AdminInterface } from "../type/admin/admin.interface";
import { User } from "./user.entity";
import { Cartela } from "./cartela.entity";

@Entity("admin")
export class Admin implements AdminInterface{
@PrimaryGeneratedColumn("uuid")
id:string;
@Column({type:"enum", enum: PermissionStatus,default:PermissionStatus.Pemitted,nullable:true})
status: PermissionStatus;
@Column({default:0,type:"decimal",precision:30,scale:2})
total_earning:number
@Column({default:0,type:"decimal",precision:30,scale:2,nullable:true})
net_earning:number
@Column({default:0,type:"decimal",precision:30,scale:2})
package:number;
@Column({default:15})
fee_percentage:number
@OneToOne(() => User, user => user.admin,)
@JoinColumn()
user: User;
@OneToMany(() => Casher, casher => casher.admin)
@JoinColumn()
 cashers: Casher[];
@ManyToOne(()=>SuperAdmin,super_admin=>super_admin.admin)
@JoinColumn({name:"super_id"})
company:SuperAdmin;
@ManyToOne(()=>Cartela,cartela=>cartela.admin)
@JoinColumn({name:"cartela_id"})
cartela:Cartela;
@Column({nullable:true})
cartela_id:string;
@Column({nullable:true})
super_id:string;
@CreateDateColumn()
created_at:Date;
}