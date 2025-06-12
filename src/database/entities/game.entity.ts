import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { GameInterface } from "../type/game/game.interface";
import { GameStatus } from "../enum/game.enum";
import { User } from "./user.entity";
import { Casher } from "./casher.entity";

@Entity("game")
export class Game implements GameInterface {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  name: string;
  @Column()
  player_bet: number
  @Column()
  total_calls: number;
  @Column()
  total_player: number;
  @Column({ type: "jsonb", default: [] })
  winner_cards: number[]
  @Column({ nullable: true, type:"decimal", precision:30, scale:2})
  derash: number
  @Column({ type: "enum", enum: GameStatus, default: GameStatus.Playing })
  status: string;
  @Column({nullable:true,default:false})
  isPreset:boolean;
  @Column({nullable:true,default:true})
  isSpecial:boolean;
  @Column({nullable:true,default:false})
  isCommon:boolean;
  @Column({nullable:true,default:false})
  isFifteen:boolean;
  @Column({ nullable: true, type:"decimal",precision:30, scale:2 })
  admin_price: number;
  @Column({nullable:true,default:10,type:"decimal", precision:30,scale:2})
  deduction_percentage:number;
  @Column({ nullable: true,type:"decimal",precision:30,scale:2 })
  company_comission: number;
  @ManyToOne(() => Casher, casher => casher.game,{cascade:true,onDelete:"CASCADE",onUpdate:"CASCADE"})
  @JoinColumn({ name: "casher_id" })
  casher: Casher;
  @Column()
  casher_id?: string
  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}