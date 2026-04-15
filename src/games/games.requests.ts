import { Type } from "class-transformer";
import { IsString, IsDate, Length, IsEnum } from "class-validator";
import { GameGenre } from "./games.enums";

export class CreateGameRequest {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @Length(1, 255)
  publisher: string;

  @Type(() => Date)
  @IsDate()
  releaseDate: Date;

  @IsString()
  @IsEnum(GameGenre)
  genre: GameGenre;
}

export class UpdateGameRequest {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @Length(1, 255)
  publisher: string;

  @Type(() => Date)
  @IsDate()
  releaseDate: Date;

  @IsString()
  @IsEnum(GameGenre)
  genre: GameGenre;
}
