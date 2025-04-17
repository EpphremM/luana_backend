import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Casher } from "./casher.entity";
import { BaseStat } from "./baseStat";

@Entity("daily")
export class DailyStat{
@PrimaryColumn({type:'date'})
date:Date;
@OneToOne(()=>BaseStat,base=>base.daily)
base_stat:BaseStat;
@ManyToOne(()=>Casher,casher=>casher.daily)
casher:Casher;
}