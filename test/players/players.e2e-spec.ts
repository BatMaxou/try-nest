import { Server } from "http";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import { PlayersModule } from "../../src/players/players.module";
import { Player } from "../../src/players/players.entity";

describe("Players (e2e)", () => {
  let app: INestApplication;
  let httpServer: Server;

  const mockPlayersRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env.test" }),
        PlayersModule,
      ],
    })
      .overrideProvider(getRepositoryToken(Player))
      .useValue(mockPlayersRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /players", () => {
    it("should return all players with public data only", async () => {
      const players = [
        Object.assign(new Player(), {
          identifier: "uuid-1",
          username: "alice",
          email: "alice@test.com",
          password: "hashed",
          admin: false,
          avatar: "avatar1.png",
          createdAt: new Date(),
        }),
        Object.assign(new Player(), {
          identifier: "uuid-2",
          username: "bob",
          email: "bob@test.com",
          password: "hashed",
          admin: true,
          avatar: null,
          createdAt: new Date(),
        }),
      ];

      mockPlayersRepository.find.mockResolvedValue(players);

      const response = await request(httpServer).get("/players").expect(200);

      expect(response.body).toEqual([
        { identifier: "uuid-1", username: "alice", avatar: "avatar1.png" },
        { identifier: "uuid-2", username: "bob", avatar: null },
      ]);

      expect(mockPlayersRepository.find).toHaveBeenCalledWith({
        order: { username: "ASC" },
      });
    });

    it("should return an empty array when no players exist", async () => {
      mockPlayersRepository.find.mockResolvedValue([]);

      const response = await request(httpServer).get("/players").expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe("GET /players/:identifier", () => {
    it("should return a player with public data only", async () => {
      const player = Object.assign(new Player(), {
        identifier: "uuid-1",
        username: "alice",
        email: "alice@test.com",
        password: "hashed",
        admin: false,
        avatar: "avatar1.png",
        createdAt: new Date(),
      });

      mockPlayersRepository.findOne.mockResolvedValue(player);

      const response = await request(httpServer)
        .get("/players/uuid-1")
        .expect(200);

      expect(response.body).toEqual({
        identifier: "uuid-1",
        username: "alice",
        avatar: "avatar1.png",
      });

      expect(mockPlayersRepository.findOne).toHaveBeenCalledWith({
        where: { identifier: "uuid-1" },
      });
    });

    it("should return 404 when player is not found", async () => {
      mockPlayersRepository.findOne.mockResolvedValue(null);

      await request(httpServer).get("/players/unknown-uuid").expect(404);
    });
  });

  describe("GET /players/:identifier/tournaments", () => {
    it("should return tournaments for a player", async () => {
      const tournaments = [
        {
          identifier: "tour-1",
          name: "Tournament A",
          maxPlayers: 16,
          startDate: "2026-05-01T00:00:00.000Z",
          status: "pending",
        },
        {
          identifier: "tour-2",
          name: "Tournament B",
          maxPlayers: 8,
          startDate: "2026-06-01T00:00:00.000Z",
          status: "in_progress",
        },
      ];

      mockPlayersRepository.findOne.mockResolvedValue({
        identifier: "uuid-1",
        tournaments,
      });

      const response = await request(httpServer)
        .get("/players/uuid-1/tournaments")
        .expect(200);

      expect(response.body).toEqual(tournaments);

      expect(mockPlayersRepository.findOne).toHaveBeenCalledWith({
        where: { identifier: "uuid-1" },
        relations: ["tournaments"],
      });
    });

    it("should return an empty array when player has no tournaments", async () => {
      mockPlayersRepository.findOne.mockResolvedValue({
        identifier: "uuid-1",
        tournaments: [],
      });

      const response = await request(httpServer)
        .get("/players/uuid-1/tournaments")
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("should return 404 when player is not found", async () => {
      mockPlayersRepository.findOne.mockResolvedValue(null);

      await request(httpServer)
        .get("/players/unknown-uuid/tournaments")
        .expect(404);
    });
  });
});
