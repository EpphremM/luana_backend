import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("entity")
export class SuperAdmin{
    @PrimaryGeneratedColumn("uuid")
    id:string;
    
}