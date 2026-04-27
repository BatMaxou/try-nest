import { Server } from "http";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";

import { TournamentsModule } from "../../src/tournaments/tournaments.module";
import { TournamentsGateway } from "../../src/tournaments/tournaments.gateway";
import { Tournament } from "../../src/tournaments/tournaments.entity";
import { TournamentStatus } from "../../src/tournaments/tournaments.enum";
import { Game } from "../../src/games/games.entity";
import { GameGenre } from "../../src/games/games.enums";
import { Player } from "../../src/players/players.entity";

describe("Tournaments (e2e)", () => {
  let app: INestApplication;
  let httpServer: Server;

  const queryBuilderMock = {
    andWhere: jest.fn(),
    orderBy: jest.fn(),
    getMany: jest.fn(),
  };

  const mockTournamentsRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    save: jest.fn(),
  };

  const mockGamesRepository = {
    findOne: jest.fn(),
  };

  const mockPlayersRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockTournamentsGateway = {
    emitStatusChanged: jest.fn(),
  };

  const authenticatedPlayer = {
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
        TournamentsModule,
      ],
    })
      .overrideProvider(getRepositoryToken(Tournament))
      .useValue(mockTournamentsRepository)
      .overrideProvider(getRepositoryToken(Game))
      .useValue(mockGamesRepository)
      .overrideProvider(getRepositoryToken(Player))
      .useValue(mockPlayersRepository)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .overrideProvider(TournamentsGateway)
      .useValue(mockTournamentsGateway)
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
    queryBuilderMock.andWhere.mockReturnValue(queryBuilderMock);
    queryBuilderMock.orderBy.mockReturnValue(queryBuilderMock);
    mockTournamentsRepository.createQueryBuilder.mockReturnValue(
      queryBuilderMock,
    );
  });

  const authenticate = () => {
    mockJwtService.verifyAsync.mockResolvedValue({
      username: authenticatedPlayer.username,
    });
    mockPlayersRepository.findOne.mockResolvedValue(authenticatedPlayer);
  };

  const sampleGame: Game = {
    identifier: "game-1",
    name: "Chess",
    publisher: "Classic",
    releaseDate: new Date("2020-01-01T00:00:00.000Z"),
    genre: GameGenre.STRATEGY,
  };

  describe("GET /tournaments", () => {
    it("should return all tournaments ordered by startDate DESC", async () => {
      const tournaments = [
        {
          identifier: "tour-1",
          name: "Tournament A",
          maxPlayers: 16,
          startDate: new Date("2026-05-01T00:00:00.000Z"),
          status: TournamentStatus.PENDING,
        },
      ];

      queryBuilderMock.getMany.mockResolvedValue(tournaments);

      const response = await request(httpServer)
        .get("/tournaments")
        .expect(200);

      expect(response.body).toEqual(
        tournaments.map((t) => ({
          ...t,
          startDate: t.startDate.toISOString(),
        })),
      );
      expect(queryBuilderMock.andWhere).not.toHaveBeenCalled();
      expect(queryBuilderMock.orderBy).toHaveBeenCalledWith(
        "tournament.startDate",
        "DESC",
      );
    });

    it("should apply every filter when provided", async () => {
      queryBuilderMock.getMany.mockResolvedValue([]);

      await request(httpServer)
        .get("/tournaments")
        .query({
          gameId: "b3f2c1d0-1234-4abc-9def-1234567890ab",
          status: TournamentStatus.PENDING,
          name: "Chess Cup",
          startDate: "2026-05-01T00:00:00.000Z",
          maxPlayers: "16",
          minSubscribedPlayers: "2",
          maxSubscribedPlayers: "10",
          fullPlayers: "true",
          isEnded: "true",
        })
        .expect(200);

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        "tournament.game_id = :gameId",
        { gameId: "b3f2c1d0-1234-4abc-9def-1234567890ab" },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        "tournament.status = :status",
        { status: TournamentStatus.PENDING },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        "tournament.name = :name",
        { name: "Chess Cup" },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        "tournament.status = :endedStatus",
        { endedStatus: TournamentStatus.COMPLETED },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        "tournament.startDate >= :startDate",
        { startDate: new Date("2026-05-01T00:00:00.000Z") },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        '"tournament"."maxPlayers" <= :maxPlayers',
        { maxPlayers: 16 },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('= "tournament"."maxPlayers"'),
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        expect.stringContaining(">= :minSubscribedPlayers"),
        { minSubscribedPlayers: 2 },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        expect.stringContaining("<= :maxSubscribedPlayers"),
        { maxSubscribedPlayers: 10 },
      );
    });

    it("should ignore fullPlayers when it is not 'true'", async () => {
      queryBuilderMock.getMany.mockResolvedValue([]);

      await request(httpServer)
        .get("/tournaments")
        .query({ fullPlayers: "false" })
        .expect(200);

      expect(queryBuilderMock.andWhere).not.toHaveBeenCalledWith(
        expect.stringContaining('= "tournament"."maxPlayers"'),
      );
    });

    it("should ignore isEnded when it is not 'true'", async () => {
      queryBuilderMock.getMany.mockResolvedValue([]);

      await request(httpServer)
        .get("/tournaments")
        .query({ isEnded: "false" })
        .expect(200);

      expect(queryBuilderMock.andWhere).not.toHaveBeenCalledWith(
        "tournament.status = :endedStatus",
        expect.anything(),
      );
    });

    it("should return 400 when gameId filter is not a UUID", async () => {
      await request(httpServer)
        .get("/tournaments")
        .query({ gameId: "not-a-uuid" })
        .expect(400);
    });

    it("should return 400 when status filter is not a valid enum value", async () => {
      await request(httpServer)
        .get("/tournaments")
        .query({ status: "unknown-status" })
        .expect(400);
    });

    it("should return 400 when startDate filter is not a valid date", async () => {
      await request(httpServer)
        .get("/tournaments")
        .query({ startDate: "not-a-date" })
        .expect(400);
    });

    it("should return 400 when maxPlayers filter is less than 1", async () => {
      await request(httpServer)
        .get("/tournaments")
        .query({ maxPlayers: "0" })
        .expect(400);
    });
  });

  describe("GET /tournaments/:id", () => {
    it("should return a tournament by identifier", async () => {
      const tournament = {
        identifier: "tour-1",
        name: "Tournament A",
        maxPlayers: 16,
        startDate: new Date("2026-05-01T00:00:00.000Z"),
        status: TournamentStatus.PENDING,
      };

      mockTournamentsRepository.findOne.mockResolvedValue(tournament);

      const response = await request(httpServer)
        .get("/tournaments/tour-1")
        .expect(200);

      expect(response.body).toEqual({
        ...tournament,
        startDate: tournament.startDate.toISOString(),
      });
      expect(mockTournamentsRepository.findOne).toHaveBeenCalledWith({
        where: { identifier: "tour-1" },
      });
    });

    it("should return 404 when tournament is not found", async () => {
      mockTournamentsRepository.findOne.mockResolvedValue(null);

      await request(httpServer).get("/tournaments/unknown").expect(404);
    });
  });

  describe("GET /tournaments/:id/matches", () => {
    it("should return matches of a tournament", async () => {
      const matches = [
        {
          identifier: "match-1",
          score: "1-0",
          round: 1,
          status: "completed",
        },
        {
          identifier: "match-2",
          score: "0-0",
          round: 2,
          status: "pending",
        },
      ];

      mockTournamentsRepository.findOne.mockResolvedValue({
        identifier: "tour-1",
        matches,
      });

      const response = await request(httpServer)
        .get("/tournaments/tour-1/matches")
        .expect(200);

      expect(response.body).toEqual({
        message: "Matches found successfully",
        matches,
      });
      expect(mockTournamentsRepository.findOne).toHaveBeenCalledWith({
        where: { identifier: "tour-1" },
        relations: { matches: true },
      });
    });

    it("should return an empty list when tournament has no matches", async () => {
      mockTournamentsRepository.findOne.mockResolvedValue({
        identifier: "tour-1",
        matches: [],
      });

      const response = await request(httpServer)
        .get("/tournaments/tour-1/matches")
        .expect(200);

      expect(response.body).toEqual({
        message: "Matches found successfully",
        matches: [],
      });
    });

    it("should return 404 when tournament is not found", async () => {
      mockTournamentsRepository.findOne.mockResolvedValue(null);

      await request(httpServer).get("/tournaments/unknown/matches").expect(404);
    });
  });

  describe("POST /tournaments", () => {
    const validBody = {
      name: "Chess Cup",
      gameId: "b3f2c1d0-1234-4abc-9def-1234567890ab",
      maxPlayers: 16,
      startDate: "2026-05-01T00:00:00.000Z",
    };

    it("should create a tournament when authenticated", async () => {
      authenticate();
      mockGamesRepository.findOne.mockResolvedValue(sampleGame);
      mockTournamentsRepository.insert.mockResolvedValue({
        identifiers: [{ identifier: "tour-new" }],
      });

      const response = await request(httpServer)
        .post("/tournaments")
        .set("Authorization", "Bearer valid-token")
        .send(validBody)
        .expect(201);

      expect(response.body).toEqual({
        message: "Tournament created successfully",
        tournament: {
          identifier: "tour-new",
          name: validBody.name,
          game: sampleGame.name,
          maxPlayers: validBody.maxPlayers,
        },
      });
      expect(mockGamesRepository.findOne).toHaveBeenCalledWith({
        where: { identifier: validBody.gameId },
      });
    });

    it("should return 401 when no token is provided", async () => {
      await request(httpServer)
        .post("/tournaments")
        .send(validBody)
        .expect(401);

      expect(mockTournamentsRepository.insert).not.toHaveBeenCalled();
    });

    it("should return 404 when the game does not exist", async () => {
      authenticate();
      mockGamesRepository.findOne.mockResolvedValue(null);

      await request(httpServer)
        .post("/tournaments")
        .set("Authorization", "Bearer valid-token")
        .send(validBody)
        .expect(404);

      expect(mockTournamentsRepository.insert).not.toHaveBeenCalled();
    });

    it("should return 400 when body is invalid", async () => {
      authenticate();

      await request(httpServer)
        .post("/tournaments")
        .set("Authorization", "Bearer valid-token")
        .send({ name: "Chess Cup" })
        .expect(400);

      expect(mockTournamentsRepository.insert).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /tournaments/:id", () => {
    it("should delete a tournament when authenticated", async () => {
      authenticate();
      mockTournamentsRepository.delete.mockResolvedValue({ affected: 1 });

      const response = await request(httpServer)
        .delete("/tournaments/tour-1")
        .set("Authorization", "Bearer valid-token")
        .expect(200);

      expect(response.body).toEqual({
        message: "Tournament deleted successfully",
      });
      expect(mockTournamentsRepository.delete).toHaveBeenCalledWith("tour-1");
    });

    it("should return 401 when no token is provided", async () => {
      await request(httpServer).delete("/tournaments/tour-1").expect(401);

      expect(mockTournamentsRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("POST /tournaments/:id/join", () => {
    it("should add the authenticated player to the tournament", async () => {
      authenticate();
      const tournament = {
        identifier: "tour-1",
        players: [] as Player[],
      };
      mockTournamentsRepository.findOne.mockResolvedValue(tournament);
      mockPlayersRepository.findOne
        .mockResolvedValueOnce(authenticatedPlayer)
        .mockResolvedValueOnce(authenticatedPlayer);
      mockTournamentsRepository.save.mockResolvedValue(tournament);

      const response = await request(httpServer)
        .post("/tournaments/tour-1/join")
        .set("Authorization", "Bearer valid-token")
        .expect(200);

      expect(response.body).toEqual({
        tournament: {
          identifier: "tour-1",
          players: [authenticatedPlayer],
        },
      });
      expect(mockTournamentsRepository.save).toHaveBeenCalled();
    });

    it("should return 401 when no token is provided", async () => {
      await request(httpServer).post("/tournaments/tour-1/join").expect(401);

      expect(mockTournamentsRepository.save).not.toHaveBeenCalled();
    });

    it("should return 404 when the tournament is not found", async () => {
      authenticate();
      mockTournamentsRepository.findOne.mockResolvedValue(null);

      await request(httpServer)
        .post("/tournaments/unknown/join")
        .set("Authorization", "Bearer valid-token")
        .expect(404);

      expect(mockTournamentsRepository.save).not.toHaveBeenCalled();
    });

    it("should return 400 when the player is already in the tournament", async () => {
      authenticate();
      mockTournamentsRepository.findOne.mockResolvedValue({
        identifier: "tour-1",
        players: [authenticatedPlayer],
      });
      mockPlayersRepository.findOne
        .mockResolvedValueOnce(authenticatedPlayer)
        .mockResolvedValueOnce(authenticatedPlayer);

      await request(httpServer)
        .post("/tournaments/tour-1/join")
        .set("Authorization", "Bearer valid-token")
        .expect(400);

      expect(mockTournamentsRepository.save).not.toHaveBeenCalled();
    });
  });
});
