import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Casher } from "./casher.entity";
import { BaseStat } from "./baseStat";

@Entity("daily")
export class YearlyStat{
@PrimaryColumn({type:'char',length:4})
year:string;
@OneToOne(()=>BaseStat,base=>base.yearly)
base_stat:BaseStat;
@ManyToOne(()=>Casher,casher=>casher.yearly)
casher:Casher;
}