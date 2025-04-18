import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
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
    @Column({type:"enum",enum:GameStatus,default:GameStatus.Playing})
    status: string;
    @Column()
    is_aggregated:boolean;
  @ManyToOne(()=>Casher,casher=>casher.game)
  @JoinColumn({name:"casher_id"})
  casher:Casher;
  @Column()
  casher_id?:string
   @CreateDateColumn({type:"timestamptz"})
   created_at:Date;
}