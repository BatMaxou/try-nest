import { IsString, IsInt, IsEnum, IsOptional, IsUUID } from "class-validator";
import { MatchStatus } from "./matches.enum";

export class CreateMatchRequest {
  @IsUUID()
  tournamentId: string;

  @IsUUID()
  player1Id: string;

  @IsUUID()
  player2Id: string;
}

export class UpdateMatchRequest {
  @IsOptional()
  @IsUUID()
  tournamentId?: string;

  @IsOptional()
  @IsUUID()
  player1Id?: string;

  @IsOptional()
  @IsUUID()
  player2Id?: string;

  @IsOptional()
  @IsUUID()
  winnerId?: string;

  @IsOptional()
  @IsString()
  score?: string;

  @IsOptional()
  @IsInt()
  round?: number;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;
}

export class ResultMatchRequest {
  @IsUUID()
  winnerId: string;

  @IsString()
  score: string;

  @IsInt()
  round: number;
}
