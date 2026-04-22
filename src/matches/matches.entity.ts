import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { Tournament } from "../tournaments/tournaments.entity";
import { Player } from "../players/players.entity";
import { MatchStatus } from "./matches.enum";

@Entity({
  name: "matches",
})
export class Match {
  @PrimaryGeneratedColumn("uuid")
  public identifier: string;

  @ManyToOne(() => Tournament, (tournament) => tournament.matches)
  @JoinColumn({ name: "tournament_id" })
  public tournament: Tournament;

  @ManyToOne(() => Player)
  @JoinColumn({ name: "player1_id" })
  public player1: Player;

  @ManyToOne(() => Player)
  @JoinColumn({ name: "player2_id" })
  public player2: Player;

  @ManyToOne(() => Player, { nullable: true })
  @JoinColumn({ name: "winner_id" })
  public winner: Player | null;

  @Column()
  public score: string;

  @Column()
  public round: number;

  @Column({
    type: "enum",
    enum: MatchStatus,
    default: MatchStatus.PENDING,
  })
  public status: MatchStatus;
}
