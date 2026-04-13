import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";

import { Player } from "../players/players.entity";
import { LoginRequest, RegisterRequest } from "./auth.requests";
import { PasswordHasherService } from "./auth.password-hasher.service";

@Injectable()
export class AuthService {
  public constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtService: JwtService,
  ) {}

  public async register(request: RegisterRequest) {
    const existing = await this.playersRepository.findOne({
      where: [
        { email: request.email.toLowerCase().trim() },
        { username: request.username },
      ],
    });

    if (existing) {
      throw new ConflictException("User already exists");
    }

    const password = this.passwordHasher.createHash(request.password);

    await this.playersRepository.insert({
      username: request.username,
      email: request.email.toLowerCase().trim(),
      password,
      avatar: request.avatar,
    });
  }

  public async login(request: LoginRequest) {
    const player = await this.playersRepository.findOne({
      where: [
        { email: request.identifier.toLowerCase().trim() },
        { username: request.identifier },
      ],
    });

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
