import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { GameInterface } from "../type/game/game.interface";
import { GameStatus } from "../anum/game.enum";
import { User } from "./user.entity";
import { Casher } from "./casher.entity";

@Entity("game")
export class Game implements GameInterface{
    @PrimaryGeneratedColumn("uuid")
    id:string;
    @Column()
    name:string;
    @Column()
    player_bet:number
    @Column()
    total_calls: number;
    @Column()
    total_player: number;
    @Column({type:"jsonb",default:[]})
    winner_cards:number[]
    @Column({type:"enum",enum:GameStatus})
    status: string;
    @Column()
    is_aggregated:boolean;
  @ManyToMany(()=>Casher,casher=>casher.game)
  casher:Casher;
   @Column({type:"timestamptz"})
   created_at:Date;

}