import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";

import { TokenPayload } from "./auth.types";
import { InjectRepository } from "@nestjs/typeorm";
import { Player } from "src/players/players.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: TokenPayload }>();

    if (!request.user) {
      return false;
    }

    const player = await this.getPlayer(request.user.username);
    if (!player || !player.admin) {
      return false;
    }

    return true;
  }

  private getPlayer(username: string): Promise<Player | null> {
    return this.playersRepository.findOne({
      where: [{ username }],
    });
  }
}
