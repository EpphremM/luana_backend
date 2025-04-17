import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { SuperInterface } from "../type/super_admin/super.admin.interface";

@Entity("entity")
export class SuperAdmin implements SuperInterface{
    @PrimaryGeneratedColumn("uuid")
    id:string;
    @Column();
     net_earning: number;
}