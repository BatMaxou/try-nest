import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Player } from "../players/players.entity";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PasswordHasherService } from "./auth.password-hasher.service";

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  providers: [AuthService, PasswordHasherService],
  controllers: [AuthController],
})
export class AuthModule {}
