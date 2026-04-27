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

  public async findByUsername(username: string): Promise<Player | null> {
    return this.playersRepository.findOne({
      where: [{ username }],
    });
  }

  public async findById(identifier: string) {
    return this.playersRepository.findOne({
      where: { identifier },
    });
  }

  public async findByUsernameOrEmail(username: string, email: string) {
    return await this.playersRepository.findOne({
      where: [{ email: email.toLowerCase().trim() }, { username: username }],
    });
  }

  public async findTournaments(identifier: string) {
    const player = await this.playersRepository.findOne({
      where: { identifier },
      relations: ["tournaments"],
    });

    return player?.tournaments;
  }

  public async create(
    username: string,
    email: string,
    password: string,
    avatar?: string,
  ) {
    await this.playersRepository.insert({
      username,
      email: email.toLowerCase().trim(),
      password,
      avatar,
    });
  }
}
