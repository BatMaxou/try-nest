import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Match } from "./matches.entity";
import { Player } from "src/players/players.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Match, Player])],
  providers: [],
  controllers: [],
})
export class MatchesModule {}
