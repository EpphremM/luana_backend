import { Column, Entity, PrimaryColumn } from "typeorm";
import { DailyInterface } from "../type/stat/stat.interface";

@Entity("daily")
export class MonthlyStat implements DailyInterface{
@PrimaryColumn({type:'date'})
date:Date;
@Column()
total_games: number;
@Column({type:'decimal',precision:30,scale:2})
total_amount: number;
}