import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("cartela")
export class Cartela{
    @PrimaryGeneratedColumn("uuid")
    id:string;
    @Column({unique:true})
    name:string;
    @Column()
    cards:string[]
}