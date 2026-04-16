import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { Player } from "src/players/players.entity";

@Injectable()
export class AuthAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const player = request.user;
    if (!player) {
      return false;
    }

    if (!player.admin) {
      return false;
    }

    return true;
  }
}
