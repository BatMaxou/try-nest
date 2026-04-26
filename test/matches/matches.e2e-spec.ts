import { Server } from "http";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";

import { MatchesModule } from "../../src/matches/matches.module";
import { Match } from "../../src/matches/matches.entity";
import { MatchStatus } from "../../src/matches/matches.enum";
import { Player } from "../../src/players/players.entity";

describe("Matches (e2e)", () => {
  let app: INestApplication;
  let httpServer: Server;

  const mockMatchesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPlayersRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const adminPlayer = {
    identifier: "uuid-admin",
    username: "admin",
    email: "admin@test.com",
    password: "hashed",
    admin: true,
    avatar: null,
  };

  const regularPlayer = {
    identifier: "uuid-user",
    username: "user",
    email: "user@test.com",
    password: "hashed",
    admin: false,
    avatar: null,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env.test" }),
        JwtModule.register({ global: true, secret: "test-secret" }),
        MatchesModule,
      ],
    })
      .overrideProvider(getRepositoryToken(Match))
      .useValue(mockMatchesRepository)
      .overrideProvider(getRepositoryToken(Player))
      .useValue(mockPlayersRepository)
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

  describe("POST /matches/:id/result", () => {
    const validBody = {
      winnerId: "b3f2c1d0-1234-4abc-9def-1234567890ab",
      score: "2-1",
      round: 3,
    };

    it("should update a match result when user is admin", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: adminPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(adminPlayer);
      mockMatchesRepository.findOne.mockResolvedValue({
        identifier: "match-1",
        status: MatchStatus.IN_PROGRESS,
      });
      mockMatchesRepository.update.mockResolvedValue({ affected: 1 });

      const response = await request(httpServer)
        .post("/matches/match-1/result")
        .set("Authorization", "Bearer valid-token")
        .send(validBody)
        .expect(200);

      expect(response.body).toEqual({
        message: "Match result updated successfully",
        match: {
          identifier: "match-1",
          winner: { identifier: validBody.winnerId },
          score: validBody.score,
          round: validBody.round,
          status: MatchStatus.COMPLETED,
        },
      });

      expect(mockMatchesRepository.update).toHaveBeenCalledWith("match-1", {
        winner: { identifier: validBody.winnerId },
        score: validBody.score,
        round: validBody.round,
        status: MatchStatus.COMPLETED,
      });
    });

    it("should return 401 when no token is provided", async () => {
      await request(httpServer)
        .post("/matches/match-1/result")
        .send(validBody)
        .expect(401);

      expect(mockMatchesRepository.update).not.toHaveBeenCalled();
    });

    it("should return 401 when token is invalid", async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error("invalid"));

      await request(httpServer)
        .post("/matches/match-1/result")
        .set("Authorization", "Bearer invalid-token")
        .send(validBody)
        .expect(401);

      expect(mockMatchesRepository.update).not.toHaveBeenCalled();
    });

    it("should return 403 when user is not admin", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: regularPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(regularPlayer);

      await request(httpServer)
        .post("/matches/match-1/result")
        .set("Authorization", "Bearer valid-token")
        .send(validBody)
        .expect(403);

      expect(mockMatchesRepository.update).not.toHaveBeenCalled();
    });

    it("should return 404 when match is not found", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: adminPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(adminPlayer);
      mockMatchesRepository.findOne.mockResolvedValue(null);

      await request(httpServer)
        .post("/matches/unknown/result")
        .set("Authorization", "Bearer valid-token")
        .send(validBody)
        .expect(404);

      expect(mockMatchesRepository.update).not.toHaveBeenCalled();
    });

    it("should return 400 when winnerId is not a UUID", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: adminPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(adminPlayer);

      await request(httpServer)
        .post("/matches/match-1/result")
        .set("Authorization", "Bearer valid-token")
        .send({ ...validBody, winnerId: "not-a-uuid" })
        .expect(400);

      expect(mockMatchesRepository.update).not.toHaveBeenCalled();
    });

    it("should return 400 when score is missing", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: adminPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(adminPlayer);

      await request(httpServer)
        .post("/matches/match-1/result")
        .set("Authorization", "Bearer valid-token")
        .send({ winnerId: validBody.winnerId, round: validBody.round })
        .expect(400);

      expect(mockMatchesRepository.update).not.toHaveBeenCalled();
    });

    it("should return 400 when round is not an integer", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: adminPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(adminPlayer);

      await request(httpServer)
        .post("/matches/match-1/result")
        .set("Authorization", "Bearer valid-token")
        .send({ ...validBody, round: "three" })
        .expect(400);

      expect(mockMatchesRepository.update).not.toHaveBeenCalled();
    });
  });
});
