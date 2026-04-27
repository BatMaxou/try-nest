import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { LoginRequest, RegisterRequest } from "./auth.requests";
import { PasswordHasherService } from "./auth.password-hasher.service";
import { PlayersService } from "../players/players.service";

@Injectable()
export class AuthService {
  public constructor(
    private readonly playersService: PlayersService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtService: JwtService,
  ) {}

  public async register(request: RegisterRequest) {
    const existing = await this.playersService.findByUsernameOrEmail(
      request.username,
      request.email,
    );

    if (existing) {
      throw new ConflictException("User already exists");
    }

    const password = this.passwordHasher.createHash(request.password);

    await this.playersService.create(
      request.username,
      request.email,
      password,
      request.avatar,
    );
  }

  public async login(request: LoginRequest) {
    const player = await this.playersService.findByUsernameOrEmail(
      request.identifier,
      request.identifier,
    );

    if (!player) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = this.passwordHasher.verify(
      request.password,
      player.password,
    );

    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = await this.jwtService.signAsync({
      username: player.username,
    });

    return { token };
  }
}
