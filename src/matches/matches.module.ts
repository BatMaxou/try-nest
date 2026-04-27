import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Match } from "./matches.entity";
import { MatchesController } from "./matches.controller";
import { MatchesService } from "./matches.service";
import { PlayersModule } from "../players/players.module";

@Module({
  imports: [TypeOrmModule.forFeature([Match]), PlayersModule],
  providers: [MatchesService],
  controllers: [MatchesController],
})
export class MatchesModule {}
