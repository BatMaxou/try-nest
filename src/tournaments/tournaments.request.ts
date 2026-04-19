import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsBooleanString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from "class-validator";

import { TournamentStatus } from "./tournaments.enum";
import { Transform, Type } from "class-transformer";

function emptyQueryToUndefined({
  value,
}: {
  value: string | number | boolean | Date | undefined;
}) {
  return value === "" ? undefined : value;
}

function stringParamToInt({ value }: { value: undefined | string }) {
  return value === "" || value === undefined ? undefined : parseInt(value);
}
export class FiltersTournamentRequest {
  @Transform(emptyQueryToUndefined)
  @IsOptional()
  @IsUUID()
  gameId?: string;

  @Transform(emptyQueryToUndefined)
  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;

  @Transform(emptyQueryToUndefined)
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @Transform(emptyQueryToUndefined)
  @IsOptional()
  @IsBooleanString()
  fullPlayers?: string;

  @Transform(emptyQueryToUndefined)
  @IsOptional()
  @IsBooleanString()
  isEnded?: string;

  @Transform(emptyQueryToUndefined)
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @Transform(emptyQueryToUndefined)
  @Transform(stringParamToInt)
  @IsOptional()
  @IsInt()
  @Min(0)
  minSubscribedPlayers?: number;

  @Transform(emptyQueryToUndefined)
  @Transform(stringParamToInt)
  @IsOptional()
  @IsInt()
  @Min(0)
  maxSubscribedPlayers?: number;

  @Transform(emptyQueryToUndefined)
  @Transform(stringParamToInt)
  @IsOptional()
  @IsInt()
  @Min(1)
  maxPlayers?: number;
}

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
