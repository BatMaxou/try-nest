import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game } from "../games/games.entity";
import { Tournament } from "./tournaments.entity";
import {
  CreateTournamentRequest,
  UpdateTournamentRequest,
} from "./tournaments.request";

@Injectable()
export class TournamentsService {
  public constructor(
    @InjectRepository(Tournament)
    private readonly tournamentsRepository: Repository<Tournament>,
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  public async findAll() {
    return this.tournamentsRepository.find({
      order: {
        name: "ASC",
      },
    });
  }

  public async findById(id: string) {
    const tournament = await this.tournamentsRepository.findOne({
      where: { identifier: id },
    });

    if (!tournament) {
      throw new NotFoundException("Tournament not found");
    }

    return tournament;
  }

  public async create(body: CreateTournamentRequest) {
    const game = await this.gamesRepository.findOne({
      where: { identifier: body.gameId },
    });

    if (!game) {
      throw new NotFoundException("Game not found");
    }

    const newTournament = await this.tournamentsRepository.insert({
      name: body.name,
      game,
      maxPlayers: body.maxPlayers,
      startDate: body.startDate,
      status: body.status,
    });
    return {
      message: "Tournament created successfully",
      tournament: {
        identifier: newTournament.identifiers[0]?.identifier as string,
        name: body.name,
        game: game.name,
        maxPlayers: body.maxPlayers,
      },
    };
  }

  public async update(id: string, body: UpdateTournamentRequest) {
    const tournament = await this.tournamentsRepository.findOne({
      where: { identifier: id },
    });

    if (!tournament) {
      throw new NotFoundException("Tournament not found");
    }

    const game = await this.gamesRepository.findOne({
      where: { identifier: body.gameId },
    });

    if (!game) {
      throw new NotFoundException("Game not found");
    }

    await this.tournamentsRepository.update(id, {
      name: body.name,
      game,
      maxPlayers: body.maxPlayers,
      startDate: body.startDate,
      status: body.status,
    });

    return {
      message: "Tournament updated successfully",
      tournament: {
        identifier: id,
        name: body.name,
        game: game,
        maxPlayers: body.maxPlayers,
        startDate: body.startDate,
        status: body.status,
      },
    };
  }

  public async delete(id: string) {
    await this.tournamentsRepository.delete(id);

    return {
      message: "Tournament deleted successfully",
    };
  }

  // public async join(id: string, body: JoinTournamentRequest) {
  // }
}
