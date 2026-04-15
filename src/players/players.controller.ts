import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseInterceptors,
} from "@nestjs/common";

import { PlayersService } from "./players.service";
import { PlayerPrivacyInterceptor } from "./players.privacy.interceptor";

@Controller("players")
export class PlayersController {
  public constructor(private readonly playersService: PlayersService) {}

  @UseInterceptors(PlayerPrivacyInterceptor)
  @Get()
  public async findAll() {
    return this.playersService.findAll();
  }

  @UseInterceptors(PlayerPrivacyInterceptor)
  @Get(":identifier")
  public async findById(@Param("identifier") identifier: string) {
    const player = await this.playersService.findById(identifier);

    if (!player) {
      throw new NotFoundException();
    }

    return player;
  }

  @Get(":identifier/tournaments")
  public async findTournaments(@Param("identifier") identifier: string) {
    const tournaments = await this.playersService.findTournaments(identifier);

    if (!tournaments) {
      throw new NotFoundException();
    }

    return tournaments;
  }
}
