import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SuperAdmin } from "./company.entity";
import { PermissionStatus } from "../enum/permission.enum";
import { User } from "./user.entity";
import { SuperAgentInterface } from "../type/super_agent/super.agent.interface";
@Entity("super-agent")
export class SuperAgent implements SuperAgentInterface{
@PrimaryGeneratedColumn()
id:string;
@Column({type:"enum", enum: PermissionStatus,default:PermissionStatus.Pemitted,nullable:true})
status: PermissionStatus;
@Column({default:0,type:"decimal",precision:30,scale:2})
package:number;
@OneToOne(() => User, user => user.admin)
@JoinColumn()
user: User;
@ManyToOne(()=>SuperAdmin,super_admin=>super_admin.admin)
@JoinColumn({name:"super_id"})
company:SuperAdmin;
@Column({nullable:true})
super_id:string;
@CreateDateColumn()
created_at:Date;
}