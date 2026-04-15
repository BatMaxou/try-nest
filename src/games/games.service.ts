import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game } from "./games.entity";
import { CreateGameRequest, UpdateGameRequest } from "./games.requests";

@Injectable()
export class GamesService {
  public constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  public async findAll() {
    return this.gamesRepository.find({
      order: {
        name: "ASC",
      },
    });
  }

  public async findById(id: string) {
    return this.gamesRepository.findOne({
      where: { identifier: id },
    });
  }

  public async create(body: CreateGameRequest) {
    const newGame = await this.gamesRepository.insert({
      name: body.name,
      publisher: body.publisher,
      releaseDate: body.releaseDate,
      genre: body.genre,
    });

    const game = await this.gamesRepository.findOne({
      where: { identifier: newGame.identifiers[0]?.identifier as string },
    });
    return {
      message: "Game created successfully",
      game,
    };
  }

  public async update(id: string, body: UpdateGameRequest) {
    await this.gamesRepository.update(id, {
      name: body.name,
      publisher: body.publisher,
      releaseDate: body.releaseDate,
      genre: body.genre,
    });

    const game = await this.gamesRepository.findOne({
      where: { identifier: id },
    });

    return {
      game,
    };
  }

  public async delete(id: string) {
    await this.gamesRepository.delete(id);

    return {
      message: "Game deleted successfully",
    };
  }
}
