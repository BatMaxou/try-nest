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
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { TournamentsService } from "./tournaments.service";
import {
  CreateTournamentRequest,
  UpdateTournamentRequest,
} from "./tournaments.request";
import { AuthAccessGuard } from "src/auth/auth.access.guard";

@Controller("tournaments")
export class TournamentsController {
  public constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  public async findAll() {
    return this.tournamentsService.findAll();
  }

  @Get(":id")
  public async findById(@Param("id") id: string) {
    return this.tournamentsService.findById(id);
  }

  @Post("create")
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

  // @Post(":id/join")
  // @HttpCode(HttpStatus.OK)
  // public async join(@Param("id") id: string, @Body(ValidationPipe) body: JoinTournamentRequest) {
  //   return this.tournamentsService.join(id, body);
  // }
}
