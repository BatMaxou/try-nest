import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Game } from "../games/games.entity";
import { Tournament } from "./tournaments.entity";
import { TournamentsService } from "./tournaments.service";
import { TournamentsController } from "./tournaments.controller";
import { Player } from "src/players/players.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Tournament, Game, Player])],
  providers: [TournamentsService],
  controllers: [TournamentsController],
})
export class TournamentsModule {}
