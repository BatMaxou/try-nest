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
}
