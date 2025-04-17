import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { GameInterface } from "../type/game/game.interface";
import { GameStatus } from "../anum/game.enum";

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
    @Column()
    winner_cards:[number]
    @Column({type:"enum",enum:GameStatus})
    status: string;
    @Column()
    is_aggregated:boolean;
   @Column({type:"timestamptz"})
   created_at:Date;

}