import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CardInterface } from "../type/card/card.interface";
import { Cartela } from "./cartela.entity";

@Entity("card")
export class Card implements CardInterface{
    @PrimaryGeneratedColumn("uuid")
    id:string;
    @Column()
    cards:number[]
    @ManyToOne(()=>Cartela,cartela=>cartela.cards)
    @JoinColumn({name:"cartela_id"})
    cartela:Cartela
    @Column()
    cartela_id:string
}