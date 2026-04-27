import { IsString, IsInt, IsUUID } from "class-validator";

export class CreateMatchRequest {
  @IsUUID()
  tournamentId: string;

  @IsUUID()
  player1Id: string;

  @IsUUID()
  player2Id: string;
}

export class ResultMatchRequest {
  @IsUUID()
  winnerId: string;

  @IsString()
  score: string;

  @IsInt()
  round: number;
}
