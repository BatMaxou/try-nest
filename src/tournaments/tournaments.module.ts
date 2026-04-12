import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tournament } from "./tournaments.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Tournament])],
  providers: [],
  controllers: [],
})
export class TournamentsModule {}
