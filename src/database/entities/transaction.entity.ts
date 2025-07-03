import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UUID } from "typeorm/driver/mongodb/bson.typings";
import { User } from "./user.entity";
import { transactionStatus, transactionType } from "../enum/transaction.type.enum";
import { TransactionInterface } from "../type/transaction/transaction.interface";

@Entity("transaction")
export class Transaction implements TransactionInterface{
    @PrimaryGeneratedColumn()
    id: string;
    @Column({ type: "enum", enum: transactionType, nullable: true })
    type: string;
    @Column()
    amount_in_birr:number;
    @Column()
    amount_in_package:number;
    @Column({type:"enum",enum:transactionStatus,default:"pending"})
    status:string
    @ManyToOne(() => User, user => user.transaction, { cascade: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "sender_id" })
    sender: User;
    @ManyToOne(() => User, user => user.transaction, { cascade: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "reciever_id" })
    reciever: User;
    @Column()
    sender_id:string;
    @Column({nullable:true})
    reciever_id?:string;
    @CreateDateColumn()
    created_at:Date;
}