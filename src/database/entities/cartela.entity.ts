import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CartelaInterface } from "../type/cartela/cartela.interface";
import { Card } from "./card.entity";

@Entity("cartela")
export class Cartela implements CartelaInterface{
    @PrimaryGeneratedColumn("uuid")
    id:string;
    @Column({unique:true})
    name:string;
    @OneToMany(()=>Card,card=>card.cartela)
    cards:Card[]
}