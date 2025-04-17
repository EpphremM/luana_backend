import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SuperInterface } from "../type/super_admin/super.admin.interface";
import { User } from "./user.entity";
import { Admin } from "./admin.entity";

@Entity("entity")
export class SuperAdmin implements SuperInterface{
    @PrimaryGeneratedColumn("uuid")
    id:string;
    @Column()
     net_earning: number;
     @Column()
     fee_percentage:number;
     @OneToOne(()=>User,user=>user.super_admin)
     user=User;
     @OneToMany(()=>Admin,admin=>admin.company)
     admin:Admin;
     @Column()
     created_at:Date;
}