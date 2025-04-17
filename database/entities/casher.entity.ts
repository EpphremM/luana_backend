import { Column, Entity, PrimaryColumn } from "typeorm";
import { PermissionStatus } from "../anum/permission.enum";
@Entity("casher")
export class Casher {
    @PrimaryColumn("uuid")
    id:string;
    @Column({type:"enum",enum:PermissionStatus})
    status:string;
}