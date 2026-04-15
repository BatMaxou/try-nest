import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthGuard } from "../auth/auth.guard";
import { Game } from "./games.entity";
import { GamesService } from "./games.service";
import { GamesController } from "./games.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  providers: [GamesService, AuthGuard],
  controllers: [GamesController],
})
export class GamesModule {}
