import { Server } from "http";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { AuthModule } from "../../src/auth/auth.module";
import { Player } from "../../src/players/players.entity";
import { PasswordHasherService } from "../../src/auth/auth.password-hasher.service";

describe("Login (e2e)", () => {
  let app: INestApplication;
  let httpServer: Server;

  const mockPlayersRepository = {
    findOne: jest.fn(),
    insert: jest.fn(),
  };

  const mockPasswordHasher = {
    createHash: jest.fn(),
    verify: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env.test" }),
        AuthModule,
      ],
    })
      .overrideProvider(getRepositoryToken(Player))
      .useValue(mockPlayersRepository)
      .overrideProvider(PasswordHasherService)
      .useValue(mockPasswordHasher)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/login", () => {
    const existingPlayer = {
      identifier: "uuid",
      username: "test",
      email: "test@test.com",
      password: "hashed-password",
      admin: false,
      avatar: "",
    };

    const validBody = {
      identifier: "test",
      password: "password",
    };

    it("should return a token when credentials are valid", async () => {
      mockPlayersRepository.findOne.mockResolvedValue(existingPlayer);
      mockPasswordHasher.verify.mockReturnValue(true);
      mockJwtService.signAsync.mockResolvedValue("signed-token");

      const response = await request(httpServer)
        .post("/auth/login")
        .send(validBody)
        .expect(200);

      expect(response.body).toEqual({ token: "signed-token" });
      expect(mockPasswordHasher.verify).toHaveBeenCalledWith(
        "password",
        "hashed-password",
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        username: existingPlayer.username,
      });
    });

    it("should accept an email as identifier", async () => {
      mockPlayersRepository.findOne.mockResolvedValue(existingPlayer);
      mockPasswordHasher.verify.mockReturnValue(true);
      mockJwtService.signAsync.mockResolvedValue("signed-token");

      await request(httpServer)
        .post("/auth/login")
        .send({ identifier: "  TEST@Test.com  ", password: "password" })
        .expect(200);

      expect(mockPlayersRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: "test@test.com" }, { username: "  TEST@Test.com  " }],
      });
    });

    it("should return 401 when no player matches the identifier", async () => {
      mockPlayersRepository.findOne.mockResolvedValue(null);

      await request(httpServer)
        .post("/auth/login")
        .send({ identifier: "unknown", password: "password" })
        .expect(401);

      expect(mockPasswordHasher.verify).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it("should return 401 when the password is invalid", async () => {
      mockPlayersRepository.findOne.mockResolvedValue(existingPlayer);
      mockPasswordHasher.verify.mockReturnValue(false);

      await request(httpServer)
        .post("/auth/login")
        .send({ identifier: "test", password: "wrong-password" })
        .expect(401);

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it("should return 400 if identifier is missing", async () => {
      await request(httpServer)
        .post("/auth/login")
        .send({ password: "password" })
        .expect(400);
    });

    it("should return 400 if password is missing", async () => {
      await request(httpServer)
        .post("/auth/login")
        .send({ identifier: "test" })
        .expect(400);
    });
  });
});
