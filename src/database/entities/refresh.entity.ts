// entities/refresh-token.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("refresh_token")
export class RefreshToken {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    tokenHash: string;

    @Column()
    deviceFingerprint: string;

    @Column({ type: "timestamptz" })
    expiresAt: Date;

    @Column({ default: false })
    revoked: boolean;

    @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User;

    @Column()
    userId: string;

    @CreateDateColumn()
    createdAt: Date;
}