import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SuperInterface } from "../type/super_admin/super.admin.interface";
import { User } from "./user.entity";
import { Admin } from "./admin.entity";

@Entity("company")
export class SuperAdmin implements SuperInterface{
    @PrimaryGeneratedColumn("uuid")
    id:string;
    @Column()
     net_earning: number;
     @Column()
     fee_percentage:number;
     @OneToMany(()=>Admin,admin=>admin.company)
     admin:Admin[];
     @OneToOne(()=>User,user=>user.super_admin)
     @JoinColumn()
     user?:User
     @CreateDateColumn()
     created_at:Date;
}