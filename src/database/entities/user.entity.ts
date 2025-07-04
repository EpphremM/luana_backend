import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, OneToMany } from "typeorm";
import { UserRole } from "../enum/role.enum";  // Enum for user roles
import { UserInterface } from "../type/user/user.interface";
import { Casher } from "./casher.entity";
import { Admin } from "./admin.entity";
import { SuperAdmin } from "./company.entity";
import { RefreshToken } from "./refresh.entity";
import { SuperAgent } from "./agent.entity";
import { Transaction } from "./transaction.entity";

@Entity("user")
export class User implements UserInterface {
    @PrimaryGeneratedColumn()
    id: string;
    @Column()
    first_name: string;
    @Column()
    last_name: string;
    @Column()
    username: string;
    @Column()
    password: string;
    @Column({ nullable: true })
    phone: string;
    @Column({ type: "enum", enum: UserRole })
    role: UserRole;
    @OneToOne(() => Casher, casher => casher.user, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    casher?: Casher;
    @OneToOne(() => Admin, admin => admin.user, { cascade: true })
    admin?: Admin;
    @OneToOne(() => SuperAgent, agent => agent.user, { cascade: true })
    super_agent?: SuperAgent;
    @OneToMany(() => RefreshToken, (token) => token.user, { onDelete: "CASCADE", onUpdate: 'CASCADE' })
    refreshTokens: RefreshToken[];
    @OneToOne(() => SuperAdmin, superr => superr.user, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    super_admin?: SuperAdmin;
    @OneToMany(() => Transaction, (transaction) => transaction.sender)
    sentTransactions: Transaction[];

    @OneToMany(() => Transaction, (transaction) => transaction.reciever)
    receivedTransactions: Transaction[];
    @CreateDateColumn()
    created_at: Date
}
