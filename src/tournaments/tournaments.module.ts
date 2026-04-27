import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Game } from "../games/games.entity";
import { Tournament } from "./tournaments.entity";
import { TournamentsService } from "./tournaments.service";
import { TournamentsController } from "./tournaments.controller";
import { TournamentsGateway } from "./tournaments.gateway";
import { PlayersModule } from "../players/players.module";

@Module({
  imports: [TypeOrmModule.forFeature([Tournament, Game]), PlayersModule],
  providers: [TournamentsService, TournamentsGateway],
  controllers: [TournamentsController],
})
export class TournamentsModule {}
