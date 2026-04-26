import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Match } from "./matches.entity";
import { MatchesController } from "./matches.controller";
import { MatchesService } from "./matches.service";
import { Player } from "../players/players.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Match, Player])],
  providers: [MatchesService],
  controllers: [MatchesController],
})
export class MatchesModule {}
