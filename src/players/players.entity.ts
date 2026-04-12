import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
} from "typeorm";

import { Tournament } from "../tournaments/tournaments.entity";

@Entity({
  name: "players",
})
export class Player {
  @PrimaryGeneratedColumn("uuid")
  public identifier: string;

  @Column({ unique: true })
  public username: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public password: string;

  @Column({ default: false })
  public admin: boolean;

  @Column({ nullable: true })
  public avatar: string;

  @ManyToMany(() => Tournament, (tournament) => tournament.players)
  public tournaments: Tournament[];

  @CreateDateColumn()
  public createdAt: Date;
}
