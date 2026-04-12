import { IsString, IsEmail, Length, IsOptional } from "class-validator";

export class RegisterRequest {
  @IsString()
  @Length(3, 30)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8)
  password: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
