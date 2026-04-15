import { Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from "class-validator";

import { TournamentStatus } from "./tournaments.enum";

export class CreateTournamentRequest {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsUUID()
  gameId: string;

  @IsInt()
  @Min(1)
  maxPlayers: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  playerIds: string[];
}

export class UpdateTournamentRequest {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsUUID()
  gameId: string;

  @IsInt()
  @Min(1)
  maxPlayers: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsEnum(TournamentStatus)
  status: TournamentStatus;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  playerIds: string[];
}
