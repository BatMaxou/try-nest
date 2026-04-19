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

import { GamesService } from "./games.service";
import { CreateGameRequest, UpdateGameRequest } from "./games.requests";
import { AuthAccessGuard } from "../auth/auth.access.guard";
import { AuthAdminGuard } from "../auth/auth.admin.guard";

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
  @UseGuards(AuthAccessGuard, AuthAdminGuard)
  public async create(
    @Body(new ValidationPipe({ transform: true })) body: CreateGameRequest,
  ) {
    return this.gamesService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthAccessGuard, AuthAdminGuard)
  public async update(
    @Param("id") id: string,
    @Body(new ValidationPipe({ transform: true })) body: UpdateGameRequest,
  ) {
    return this.gamesService.update(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthAccessGuard, AuthAdminGuard)
  public async delete(@Param("id") id: string) {
    return this.gamesService.delete(id);
  }
}
