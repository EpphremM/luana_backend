import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, OneToMany } from "typeorm";
import { UserRole } from "../anum/role.enum";  // Enum for user roles
import { UserInterface } from "../type/user/user.interface";
import { Casher } from "./casher.entity";
import { Admin } from "./admin.entity";
import { SuperAdmin } from "./company.entity";
import { RefreshToken } from "./refresh.entity";

@Entity("user")
export class User implements UserInterface {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    username: string;

    @Column()
    password: string;
    @Column({nullable:true})
    phone:string;
    @Column({ type: "enum", enum: UserRole })
    role: UserRole;
    @OneToOne(() => Casher,casher=>casher.user)
    casher?:Casher;
    @OneToOne(() => Admin, admin => admin.user)
    admin?: Admin;
    @OneToMany(() => RefreshToken, (token) => token.user)
    refreshTokens: RefreshToken[];
    @OneToOne(()=>SuperAdmin,superr=>superr.user)
    super_admin?:SuperAdmin;
    @CreateDateColumn()
    created_at: Date
}
