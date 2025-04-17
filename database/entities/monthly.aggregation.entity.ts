import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { DailyInterface } from "../type/stat/stat.interface";
import { Casher } from "./casher.entity";

@Entity("daily")
export class MonthlyStat implements DailyInterface{
@PrimaryColumn({type:'date'})
date:Date;
@Column()
total_games: number;
@Column({type:'decimal',precision:30,scale:2})
total_amount: number;
@ManyToOne(()=>Casher,casher=>casher.daily)
casher:Casher;
}