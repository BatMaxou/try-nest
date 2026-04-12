import { Body, Controller, Post, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterRequest } from "./auth.requests";

@Controller("auth")
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post("register")
  public async register(@Body(ValidationPipe) body: RegisterRequest) {
    await this.authService.register(body);
  }
}
