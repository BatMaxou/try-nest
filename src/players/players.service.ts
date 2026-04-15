import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Player } from "./players.entity";

@Injectable()
export class PlayersService {
  public constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  public async findAll() {
    return this.playersRepository.find({
      order: {
        username: "ASC",
      },
    });
  }

  public async findById(id: string) {
    const player = await this.playersRepository.findOne({
      where: { identifier: id },
    });

    if (!player) {
      throw new NotFoundException("Player not found");
    }

    return player;
  }

  public async getPlayerTournaments(id: string) {
    const player = await this.playersRepository.findOne({
      where: { identifier: id },
      relations: ["tournaments"],
      select: ["tournaments"],
    });

    if (!player) {
      throw new NotFoundException("Player not found");
    }

    return player.tournaments;
  }
}
