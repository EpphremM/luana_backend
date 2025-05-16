import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { CartelaInterface } from "../type/cartela/cartela.interface";
import { Card } from "./card.entity";
import { Admin } from "./admin.entity";

@Entity("cartela")
export class Cartela implements CartelaInterface{
    @PrimaryGeneratedColumn("uuid")
    id:string;
    @Column()
    name:string;
    @OneToMany(()=>Card,card=>card.cartela)
    cards:Card[]
    @OneToMany(()=>Admin,admin=>admin.cartela)
    admin:Admin[]
    @CreateDateColumn()
    created_at:Date
}