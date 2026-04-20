import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Match } from "./matches.entity";
import {
  CreateMatchRequest,
  ResultMatchRequest,
  UpdateMatchRequest,
} from "./matches.requests";
import { MatchStatus } from "./matches.enum";

@Injectable()
export class MatchesService {
  public constructor(
    @InjectRepository(Match)
    private readonly matchesRepository: Repository<Match>,
  ) {}

  public findAll() {
    return this.matchesRepository.find({
      order: {
        round: "ASC",
      },
      relations: {
        tournament: true,
        player1: true,
        player2: true,
      },
    });
  }

  public findById(id: string) {
    return this.matchesRepository.findOne({
      where: { identifier: id },
      relations: {
        tournament: true,
        player1: true,
        player2: true,
        winner: true,
      },
    });
  }

  public async create(body: CreateMatchRequest) {
    const createdMatch = await this.matchesRepository.insert({
      tournament: { identifier: body.tournamentId },
      player1: { identifier: body.player1Id },
      player2: { identifier: body.player2Id },
      score: "0-0",
      round: 1,
    });

    const createdMatchId = createdMatch.identifiers[0]?.identifier as string;
    const match = await this.matchesRepository.findOne({
      where: { identifier: createdMatchId },
      relations: { tournament: true, player1: true, player2: true },
    });

    return {
      message: "Match created successfully",
      match,
    };
  }

  public async update(id: string, body: UpdateMatchRequest) {
    const existing = await this.matchesRepository.findOne({
      where: { identifier: id },
    });

    if (!existing) {
      throw new NotFoundException("Match not found");
    }

    await this.matchesRepository.update(id, {
      ...(body.score !== undefined ? { score: body.score } : {}),
      ...(body.round !== undefined ? { round: body.round } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.tournamentId !== undefined
        ? { tournament: { identifier: body.tournamentId } }
        : {}),
      ...(body.player1Id !== undefined
        ? { player1: { identifier: body.player1Id } }
        : {}),
      ...(body.player2Id !== undefined
        ? { player2: { identifier: body.player2Id } }
        : {}),
      ...(body.winnerId !== undefined
        ? { winner: { identifier: body.winnerId } }
        : {}),
    });

    const match = await this.matchesRepository.findOne({
      where: { identifier: id },
      relations: {
        tournament: true,
        player1: true,
        player2: true,
        winner: true,
      },
    });

    return { match };
  }

  public async result(id: string, body: ResultMatchRequest) {
    const existing = await this.matchesRepository.findOne({
      where: { identifier: id },
    });

    if (!existing) {
      throw new NotFoundException("Match not found");
    }

    await this.matchesRepository.update(id, {
      winner: { identifier: body.winnerId },
      score: body.score,
      round: body.round,
      status: MatchStatus.COMPLETED,
    });

    return {
      message: "Match result updated successfully",
      match: {
        identifier: id,
        winner: { identifier: body.winnerId },
        score: body.score,
        round: body.round,
        status: MatchStatus.COMPLETED,
      },
    };
  }

  public async delete(id: string) {
    await this.matchesRepository.delete(id);

    return {
      message: "Match deleted successfully",
    };
  }
}
