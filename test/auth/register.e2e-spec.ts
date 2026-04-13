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

describe("Register (e2e)", () => {
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

  describe("POST /auth/register", () => {
    const validBody = {
      username: "test",
      email: "test@test.com",
      password: "password",
    };

    it("should register a new player", async () => {
      mockPlayersRepository.findOne.mockResolvedValue(null);
      mockPlayersRepository.insert.mockResolvedValue(undefined);

      await request(httpServer)
        .post("/auth/register")
        .send(validBody)
        .expect(201);

      expect(mockPlayersRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "test",
          email: "test@test.com",
        }),
      );
    });

    it("should return 409 if username already exists", async () => {
      mockPlayersRepository.findOne.mockResolvedValue({
        identifier: "uuid",
        username: "test",
        email: "existing-player@test.com",
      });

      await request(httpServer)
        .post("/auth/register")
        .send(validBody)
        .expect(409);
    });

    it("should return 409 if email already exists", async () => {
      mockPlayersRepository.findOne.mockResolvedValue({
        identifier: "uuid",
        username: "existingPlayer",
        email: "test@test.com",
      });

      await request(httpServer)
        .post("/auth/register")
        .send(validBody)
        .expect(409);
    });

    it("should return 400 if email is invalid", async () => {
      await request(httpServer)
        .post("/auth/register")
        .send({ ...validBody, email: "not-an-email" })
        .expect(400);
    });

    it("should return 400 if password is too short", async () => {
      await request(httpServer)
        .post("/auth/register")
        .send({ ...validBody, password: "short" })
        .expect(400);
    });

    it("should return 400 if username is missing", async () => {
      await request(httpServer)
        .post("/auth/register")
        .send({ ...validBody, username: "" })
        .expect(400);
    });
  });
});
