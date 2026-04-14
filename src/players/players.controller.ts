import { Controller, Get } from "@nestjs/common";
import { PlayersService } from "./players.service";

@Controller("players")
export class PlayersController {
  public constructor(private readonly playersService: PlayersService) {}

  @Get()
  public async findAll() {
    return this.playersService.findAll();
  }
}
