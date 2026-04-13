import {
  Body,
  Controller,
  HttpStatus,
  HttpCode,
  Post,
  ValidationPipe,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { LoginRequest, RegisterRequest } from "./auth.requests";

@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  public async register(@Body(ValidationPipe) body: RegisterRequest) {
    await this.authService.register(body);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async login(@Body(ValidationPipe) body: LoginRequest) {
    return this.authService.login(body);
  }
}
