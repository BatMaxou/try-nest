import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Game } from "./games.entity";
import { GamesService } from "./games.service";
import { GamesController } from "./games.controller";
import { PlayersModule } from "../players/players.module";

@Module({
  imports: [TypeOrmModule.forFeature([Game]), PlayersModule],
  providers: [GamesService],
  controllers: [GamesController],
})
export class GamesModule {}
