import { Interface } from "readline";
import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { UUID } from "typeorm/driver/mongodb/bson.typings";

export interface CartelaInterface{
id:string;
name:string;
cards:[];
}