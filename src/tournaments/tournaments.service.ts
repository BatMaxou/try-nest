import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game } from "../games/games.entity";
import { Tournament } from "./tournaments.entity";
import {
  CreateTournamentRequest,
  FiltersTournamentRequest,
  UpdateTournamentRequest,
} from "./tournaments.request";
import { REQUEST } from "@nestjs/core";
import { Player } from "src/players/players.entity";
import { TournamentStatus } from "./tournaments.enum";

@Injectable({ scope: Scope.REQUEST })
export class TournamentsService {
  public constructor(
    @InjectRepository(Tournament)
    private readonly tournamentsRepository: Repository<Tournament>,
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}

  public async findAll(filters?: FiltersTournamentRequest) {
    const query = this.tournamentsRepository.createQueryBuilder("tournament");

    const needsSubscribedCount =
      filters?.fullPlayers === "true" ||
      filters?.minSubscribedPlayers != null ||
      filters?.maxSubscribedPlayers != null;

    if (needsSubscribedCount) {
      query
        .leftJoin("tournament.players", "subscribedPlayer")
        .groupBy("tournament.identifier")
        .addGroupBy('"tournament"."maxPlayers"');
    }

    if (filters?.gameId) {
      query.andWhere("tournament.game_id = :gameId", {
        gameId: filters.gameId,
      });
    }

    if (filters?.status) {
      query.andWhere("tournament.status = :status", {
        status: filters.status,
      });
    }

    if (filters?.name) {
      query.andWhere("tournament.name = :name", {
        name: filters.name,
      });
    }

    if (filters?.isEnded === "true") {
      query.andWhere("tournament.status = :endedStatus", {
        endedStatus: TournamentStatus.COMPLETED,
      });
    }

    if (filters?.startDate) {
      query.andWhere("tournament.startDate >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters?.maxPlayers != null) {
      query.andWhere('"tournament"."maxPlayers" <= :maxPlayers', {
        maxPlayers: filters.maxPlayers,
      });
    }

    if (needsSubscribedCount && filters) {
      const suscribedPlayers =
        'COUNT(DISTINCT "subscribedPlayer"."identifier")';
      const havings: string[] = [];
      const havingParams: Record<string, number> = {};

      if (filters.fullPlayers === "true") {
        havings.push(`${suscribedPlayers} = "tournament"."maxPlayers"`);
      }
      if (filters.minSubscribedPlayers != null) {
        havings.push(`${suscribedPlayers} >= :minSubscribedPlayers`);
        havingParams.minSubscribedPlayers = filters.minSubscribedPlayers;
      }
      if (filters.maxSubscribedPlayers != null) {
        havings.push(`${suscribedPlayers} <= :maxSubscribedPlayers`);
        havingParams.maxSubscribedPlayers = filters.maxSubscribedPlayers;
      }

      query.having(havings.join(" AND "), havingParams);
    }

    return query.orderBy("tournament.startDate", "DESC").getMany();
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

  public async join(id: string) {
    const tournament = await this.tournamentsRepository.findOne({
      where: { identifier: id },
      relations: { players: true },
    });

    if (!tournament) {
      throw new NotFoundException("Tournament not found");
    }

    const currentUserId = (this.request as Request & { user: Player }).user
      ?.identifier;

    const player = await this.playersRepository.findOne({
      where: { identifier: currentUserId },
    });

    if (!player) {
      throw new NotFoundException("Player not found");
    }

    if (tournament.players.some((p) => p.identifier === player.identifier)) {
      throw new BadRequestException("Player already in tournament");
    }

    tournament.players = [...tournament.players, player];
    await this.tournamentsRepository.save(tournament);

    return {
      tournament,
    };
  }
}
