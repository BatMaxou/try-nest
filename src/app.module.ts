import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TournamentsModule } from "./tournaments/tournaments.module";
import { PlayersModule } from "./players/players.module";
import { MatchesModule } from "./matches/matches.module";
import { GamesModule } from "./games/games.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DATABASE_HOST"),
        port: config.get<number>("DATABASE_PORT"),
        username: config.get<string>("DATABASE_USERNAME"),
        password: config.get<string>("DATABASE_PASSWORD"),
        database: config.get<string>("DATABASE_NAME"),
        synchronize: config.get("NODE_ENV") === "development",
        autoLoadEntities: true,
      }),
    }),
    GamesModule,
    PlayersModule,
    TournamentsModule,
    MatchesModule,
    AuthModule,
  ],
})
export class AppModule {}
