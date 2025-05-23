import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SuperInterface } from "../type/super_admin/super.admin.interface";
import { User } from "./user.entity";
import { Admin } from "./admin.entity";

@Entity("company")
export class SuperAdmin implements SuperInterface{
    @PrimaryGeneratedColumn("uuid")
    id:string;
    @Column({default:0,type:"decimal",precision:30,scale:2})
     net_earning: number;
     @Column({default:15})
     fee_percentage:number;
     @OneToMany(()=>Admin,admin=>admin.company,{onDelete:"CASCADE",onUpdate:"CASCADE"})
     admin:Admin[];
     @OneToOne(()=>User,user=>user.super_admin,{cascade:true})
     @JoinColumn()
     user?:User
     @CreateDateColumn()
     created_at:Date;
}