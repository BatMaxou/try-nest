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

import { AuthAccessGuard } from "../auth/auth.access.guard";
import { AuthAdminGuard } from "../auth/auth.admin.guard";
import {
  CreateMatchRequest,
  ResultMatchRequest,
  UpdateMatchRequest,
} from "./matches.requests";
import { MatchesService } from "./matches.service";

@Controller("matches")
export class MatchesController {
  public constructor(private readonly matchesService: MatchesService) {}

  @Get()
  public findAll() {
    return this.matchesService.findAll();
  }

  @Get(":id")
  public findById(@Param("id") id: string) {
    return this.matchesService.findById(id);
  }

  @Post("create")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthAccessGuard, AuthAdminGuard)
  public create(
    @Body(new ValidationPipe({ transform: true })) body: CreateMatchRequest,
  ) {
    return this.matchesService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthAccessGuard, AuthAdminGuard)
  public update(
    @Param("id") id: string,
    @Body(new ValidationPipe({ transform: true })) body: UpdateMatchRequest,
  ) {
    return this.matchesService.update(id, body);
  }

  @Post(":id/result")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthAccessGuard, AuthAdminGuard)
  public result(
    @Param("id") id: string,
    @Body(new ValidationPipe({ transform: true })) body: ResultMatchRequest,
  ) {
    return this.matchesService.result(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthAccessGuard, AuthAdminGuard)
  public delete(@Param("id") id: string) {
    return this.matchesService.delete(id);
  }
}
