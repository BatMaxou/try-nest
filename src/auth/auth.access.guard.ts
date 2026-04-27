import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

import { TokenPayload } from "./auth.types";
import { Player } from "../players/players.entity";
import { PlayersService } from "../players/players.service";

@Injectable()
export class AuthAccessGuard implements CanActivate {
  constructor(
    private readonly playersService: PlayersService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const tokenPayload =
        await this.jwtService.verifyAsync<TokenPayload>(token);
      const username = tokenPayload.username;
      if (!username) {
        throw new UnauthorizedException();
      }

      const maybePlayer = await this.getPlayer(username);
      if (!maybePlayer) {
        throw new UnauthorizedException();
      }

      request.user = maybePlayer;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    return type === "Bearer" ? token : undefined;
  }

  private getPlayer(username: string): Promise<Player | null> {
    return this.playersService.findByUsername(username);
  }
}
