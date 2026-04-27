import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PasswordHasherService } from "./auth.password-hasher.service";
import { PlayersModule } from "../players/players.module";

@Module({
  imports: [
    PlayersModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>("JWT_SECRET");
        if (!secret) {
          throw new Error("JWT_SECRET is not configured");
        }

        return {
          secret,
          signOptions: { expiresIn: "2h" },
        };
      },
    }),
  ],
  providers: [AuthService, PasswordHasherService],
  controllers: [AuthController],
})
export class AuthModule {}
