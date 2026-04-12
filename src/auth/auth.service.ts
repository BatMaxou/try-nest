import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Player } from "../players/players.entity";
import { RegisterRequest } from "./auth.requests";
import { PasswordHasherService } from "./auth.password-hasher.service";

@Injectable()
export class AuthService {
  public constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
    private readonly passwordHasher: PasswordHasherService,
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
}
