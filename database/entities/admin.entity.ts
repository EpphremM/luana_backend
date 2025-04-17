import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("admin")
export class Admin{
@PrimaryGeneratedColumn("uuid")
id:string;
@Column()
status:string;


}