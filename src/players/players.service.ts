import { Injectable } from "@nestjs/common";
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

  public async findById(identifier: string) {
    return this.playersRepository.findOne({
      where: { identifier },
    });
  }

  public async findTournaments(identifier: string) {
    const player = await this.playersRepository.findOne({
      where: { identifier },
      relations: ["tournaments"],
    });

    return player?.tournaments;
  }
}
