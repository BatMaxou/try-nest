import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";

import { TournamentsService } from "./tournaments.service";
import {
  CreateTournamentRequest,
  FiltersTournamentRequest,
  UpdateTournamentRequest,
} from "./tournaments.request";
import { AuthAccessGuard } from "../auth/auth.access.guard";

@Controller("tournaments")
export class TournamentsController {
  public constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  public async findAll(
    @Query(new ValidationPipe({ transform: true }))
    filters: FiltersTournamentRequest,
  ) {
    return this.tournamentsService.findAll(filters);
  }

  @Get(":id")
  public async findById(@Param("id") id: string) {
    return this.tournamentsService.findById(id);
  }

  @Get(":id/matches")
  public async findMatches(@Param("id") id: string) {
    return this.tournamentsService.findMatches(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthAccessGuard)
  public async create(@Body(ValidationPipe) body: CreateTournamentRequest) {
    return this.tournamentsService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthAccessGuard)
  public async update(
    @Param("id") id: string,
    @Body(ValidationPipe) body: UpdateTournamentRequest,
  ) {
    return this.tournamentsService.update(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthAccessGuard)
  public async delete(@Param("id") id: string) {
    return this.tournamentsService.delete(id);
  }

  @Post(":id/join")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthAccessGuard)
  public async join(@Param("id") id: string) {
    return this.tournamentsService.join(id);
  }
}
