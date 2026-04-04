import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Note } from "./Note";

export type Role = "admin" | "user";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column({
    type: "text",
    default: "user"
  })
  role!: Role;

  @OneToMany(() => Note, (note) => note.user)
  notes!: Note[];
}