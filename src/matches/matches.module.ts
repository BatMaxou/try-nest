import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Match } from "./matches.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Match])],
  providers: [],
  controllers: [],
})
export class MatchesModule {}
