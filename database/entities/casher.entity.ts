import { Column, Entity, PrimaryColumn } from "typeorm";
import { PermissionStatus } from "../anum/permission.enum";
import { CasherInterface } from "../type/casher/casher.interface";
@Entity("casher")
export class Casher implements CasherInterface {
    @PrimaryColumn("uuid")
    id:string;
    @Column({type:"enum",enum:PermissionStatus})
    status:string;
}