import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { GamesService } from "./games.service";
import { CreateGameRequest, UpdateGameRequest } from "./games.requests";
import { AuthGuard } from "../auth/auth.guard";

@Controller("games")
export class GamesController {
  public constructor(private readonly gamesService: GamesService) {}

  @Get()
  public async findAll() {
    return this.gamesService.findAll();
  }

  @Get(":id")
  public async findById(@Param("id") id: string) {
    return this.gamesService.findById(id);
  }

  @UseGuards(AuthGuard)
  @Post("create")
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body(new ValidationPipe({ transform: true })) body: CreateGameRequest,
  ) {
    return this.gamesService.create(body);
  }

  @UseGuards(AuthGuard)
  @Put(":id")
  @HttpCode(HttpStatus.OK)
  public async update(
    @Param("id") id: string,
    @Body(new ValidationPipe({ transform: true })) body: UpdateGameRequest,
  ) {
    return this.gamesService.update(id, body);
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  public async delete(@Param("id") id: string) {
    return this.gamesService.delete(id);
  }
}
