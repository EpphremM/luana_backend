import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseStateInterface } from "../type/stat/stat.interface";
import { DailyStat } from "./daily.aggregation.entity";
import { MonthlyStat } from "./monthly.aggregation.entity";
import { YearlyStat } from "./yearly.aggregation.entity";

@Entity("base-stat")
export class BaseStat implements BaseStateInterface{
    @PrimaryGeneratedColumn("uuid")
id:string;
    @Column()
    total_games:number;
    @Column()
    total_amount:number;
    @OneToOne(()=>DailyStat,daily=>daily.base_stat)
    daily:DailyStat;
    @OneToOne(()=>MonthlyStat,month=>month.base_stat)
    monthly:MonthlyStat;
    @OneToOne(()=>YearlyStat,year=>year.base_stat)
    yearly:YearlyStat;
    @Column()
    created_at:Date;
}