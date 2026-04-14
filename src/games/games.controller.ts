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
  ValidationPipe,
} from "@nestjs/common";
import { GamesService } from "./games.service";
import { CreateGameRequest, UpdateGameRequest } from "./games.requests";

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

  @Post("create")
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body(new ValidationPipe({ transform: true })) body: CreateGameRequest,
  ) {
    return this.gamesService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  public async update(
    @Param("id") id: string,
    @Body(new ValidationPipe({ transform: true })) body: UpdateGameRequest,
  ) {
    return this.gamesService.update(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  public async delete(@Param("id") id: string) {
    return this.gamesService.delete(id);
  }
}
