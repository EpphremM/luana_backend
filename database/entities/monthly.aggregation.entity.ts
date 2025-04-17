import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Casher } from "./casher.entity";
import { BaseStat } from "./baseStat";

@Entity("daily")
export class MonthlyStat{
@PrimaryColumn({type:'char',length:7})
month:string;
@OneToOne(()=>BaseStat,base=>base.monthly)
base_stat:BaseStat

@ManyToOne(()=>Casher,casher=>casher.daily)
casher:Casher;
}