import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
} from "typeorm";

import { Game } from "../games/games.entity";
import { Player } from "../players/players.entity";
import { Match } from "../matches/matches.entity";
import { TournamentStatus } from "./tournaments.enum";

@Entity({
  name: "tournaments",
})
export class Tournament {
  @PrimaryGeneratedColumn("uuid")
  public identifier: string;

  @Column()
  public name: string;

  @ManyToOne(() => Game, { eager: true })
  @JoinColumn({ name: "game_id" })
  public game: Game;

  @Column()
  public maxPlayers: number;

  @Column()
  public startDate: Date;

  @Column({
    type: "enum",
    enum: TournamentStatus,
    default: TournamentStatus.PENDING,
  })
  public status: TournamentStatus;

  @ManyToMany(() => Player, (player) => player.tournaments)
  @JoinTable({
    name: "tournaments_players",
    joinColumn: { name: "tournament_id", referencedColumnName: "identifier" },
    inverseJoinColumn: {
      name: "player_id",
      referencedColumnName: "identifier",
    },
  })
  public players: Player[];

  @OneToMany(() => Match, (match) => match.tournament)
  public matches: Match[];

  @CreateDateColumn()
  public createdAt: Date;
}
