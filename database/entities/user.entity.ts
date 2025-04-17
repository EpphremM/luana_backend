import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { UserRole } from "../anum/role.enum";  // Enum for user roles
import { UserInterface } from "../type/user/user.interface";

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

    @Column({ type: "enum", enum: UserRole })
    role: UserRole;
}
