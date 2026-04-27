import { Server } from "http";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";

import { GamesModule } from "../../src/games/games.module";
import { Game } from "../../src/games/games.entity";
import { GameGenre } from "../../src/games/games.enums";
import { Player } from "../../src/players/players.entity";

describe("Games (e2e)", () => {
  let app: INestApplication;
  let httpServer: Server;

  const mockGamesRepository = {
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
        GamesModule,
      ],
    })
      .overrideProvider(getRepositoryToken(Game))
      .useValue(mockGamesRepository)
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

  describe("GET /games", () => {
    it("should return all games", async () => {
      const games = [
        {
          identifier: "uuid-1",
          name: "Chess",
          publisher: "Classic",
          releaseDate: new Date("2020-01-01T00:00:00.000Z"),
          genre: GameGenre.STRATEGY,
        },
        {
          identifier: "uuid-2",
          name: "Doom",
          publisher: "id Software",
          releaseDate: new Date("1993-12-10T00:00:00.000Z"),
          genre: GameGenre.FPS,
        },
      ];

      mockGamesRepository.find.mockResolvedValue(games);

      const response = await request(httpServer).get("/games").expect(200);

      expect(response.body).toEqual(
        games.map((game) => ({
          ...game,
          releaseDate: game.releaseDate.toISOString(),
        })),
      );

      expect(mockGamesRepository.find).toHaveBeenCalledWith({
        order: { name: "ASC" },
      });
    });

    it("should return an empty array when no games exist", async () => {
      mockGamesRepository.find.mockResolvedValue([]);

      const response = await request(httpServer).get("/games").expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe("GET /games/:id", () => {
    it("should return a game by identifier", async () => {
      const game = {
        identifier: "uuid-1",
        name: "Chess",
        publisher: "Classic",
        releaseDate: new Date("2020-01-01T00:00:00.000Z"),
        genre: GameGenre.STRATEGY,
      };

      mockGamesRepository.findOne.mockResolvedValue(game);

      const response = await request(httpServer)
        .get("/games/uuid-1")
        .expect(200);

      expect(response.body).toEqual({
        ...game,
        releaseDate: game.releaseDate.toISOString(),
      });

      expect(mockGamesRepository.findOne).toHaveBeenCalledWith({
        where: { identifier: "uuid-1" },
      });
    });
  });

  describe("POST /games", () => {
    const validBody = {
      name: "Chess",
      publisher: "Classic",
      releaseDate: "2020-01-01T00:00:00.000Z",
      genre: GameGenre.STRATEGY,
    };

    it("should create a game when user is admin", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: adminPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(adminPlayer);

      const createdGame = {
        identifier: "uuid-new",
        name: validBody.name,
        publisher: validBody.publisher,
        releaseDate: new Date(validBody.releaseDate),
        genre: validBody.genre,
      };

      mockGamesRepository.insert.mockResolvedValue({
        identifiers: [{ identifier: "uuid-new" }],
      });
      mockGamesRepository.findOne.mockResolvedValue(createdGame);

      const response = await request(httpServer)
        .post("/games")
        .set("Authorization", "Bearer valid-token")
        .send(validBody)
        .expect(201);

      expect(response.body).toEqual({
        message: "Game created successfully",
        game: {
          ...createdGame,
          releaseDate: createdGame.releaseDate.toISOString(),
        },
      });

      expect(mockGamesRepository.insert).toHaveBeenCalledWith({
        name: validBody.name,
        publisher: validBody.publisher,
        releaseDate: new Date(validBody.releaseDate),
        genre: validBody.genre,
      });
    });

    it("should return 401 when no token is provided", async () => {
      await request(httpServer).post("/games").send(validBody).expect(401);

      expect(mockGamesRepository.insert).not.toHaveBeenCalled();
    });

    it("should return 401 when token is invalid", async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error("invalid"));

      await request(httpServer)
        .post("/games")
        .set("Authorization", "Bearer invalid-token")
        .send(validBody)
        .expect(401);

      expect(mockGamesRepository.insert).not.toHaveBeenCalled();
    });

    it("should return 403 when user is not admin", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: regularPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(regularPlayer);

      await request(httpServer)
        .post("/games")
        .set("Authorization", "Bearer valid-token")
        .send(validBody)
        .expect(403);

      expect(mockGamesRepository.insert).not.toHaveBeenCalled();
    });

    it("should return 400 when body is invalid", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: adminPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(adminPlayer);

      await request(httpServer)
        .post("/games")
        .set("Authorization", "Bearer valid-token")
        .send({ name: "Chess" })
        .expect(400);

      expect(mockGamesRepository.insert).not.toHaveBeenCalled();
    });
  });

  describe("PUT /games/:id", () => {
    const validBody = {
      name: "Chess Updated",
      publisher: "Classic",
      releaseDate: "2020-01-01T00:00:00.000Z",
      genre: GameGenre.STRATEGY,
    };

    it("should update a game when user is admin", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: adminPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(adminPlayer);

      const updatedGame = {
        identifier: "uuid-1",
        name: validBody.name,
        publisher: validBody.publisher,
        releaseDate: new Date(validBody.releaseDate),
        genre: validBody.genre,
      };

      mockGamesRepository.update.mockResolvedValue({ affected: 1 });
      mockGamesRepository.findOne.mockResolvedValue(updatedGame);

      const response = await request(httpServer)
        .put("/games/uuid-1")
        .set("Authorization", "Bearer valid-token")
        .send(validBody)
        .expect(200);

      expect(response.body).toEqual({
        game: {
          ...updatedGame,
          releaseDate: updatedGame.releaseDate.toISOString(),
        },
      });

      expect(mockGamesRepository.update).toHaveBeenCalledWith("uuid-1", {
        name: validBody.name,
        publisher: validBody.publisher,
        releaseDate: new Date(validBody.releaseDate),
        genre: validBody.genre,
      });
    });

    it("should return 401 when no token is provided", async () => {
      await request(httpServer)
        .put("/games/uuid-1")
        .send(validBody)
        .expect(401);

      expect(mockGamesRepository.update).not.toHaveBeenCalled();
    });

    it("should return 403 when user is not admin", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: regularPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(regularPlayer);

      await request(httpServer)
        .put("/games/uuid-1")
        .set("Authorization", "Bearer valid-token")
        .send(validBody)
        .expect(403);

      expect(mockGamesRepository.update).not.toHaveBeenCalled();
    });

    it("should return 400 when body is invalid", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: adminPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(adminPlayer);

      await request(httpServer)
        .put("/games/uuid-1")
        .set("Authorization", "Bearer valid-token")
        .send({ name: "Chess Updated" })
        .expect(400);

      expect(mockGamesRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /games/:id", () => {
    it("should delete a game when user is admin", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: adminPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(adminPlayer);
      mockGamesRepository.delete.mockResolvedValue({ affected: 1 });

      const response = await request(httpServer)
        .delete("/games/uuid-1")
        .set("Authorization", "Bearer valid-token")
        .expect(200);

      expect(response.body).toEqual({
        message: "Game deleted successfully",
      });

      expect(mockGamesRepository.delete).toHaveBeenCalledWith("uuid-1");
    });

    it("should return 401 when no token is provided", async () => {
      await request(httpServer).delete("/games/uuid-1").expect(401);

      expect(mockGamesRepository.delete).not.toHaveBeenCalled();
    });

    it("should return 403 when user is not admin", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        username: regularPlayer.username,
      });
      mockPlayersRepository.findOne.mockResolvedValue(regularPlayer);

      await request(httpServer)
        .delete("/games/uuid-1")
        .set("Authorization", "Bearer valid-token")
        .expect(403);

      expect(mockGamesRepository.delete).not.toHaveBeenCalled();
    });
  });
});
