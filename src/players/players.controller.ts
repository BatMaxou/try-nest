import { Controller, Get, Param } from "@nestjs/common";
import { PlayersService } from "./players.service";

@Controller("players")
export class PlayersController {
  public constructor(private readonly playersService: PlayersService) {}

  @Get()
  public async findAll() {
    return this.playersService.findAll();
  }

  @Get(":id")
  public async findById(@Param("id") id: string) {
    return this.playersService.findById(id);
  }

  @Get(":id/tournaments")
  public async getPlayerTournaments(@Param("id") id: string) {
    return this.playersService.getPlayerTournaments(id);
  }
}
