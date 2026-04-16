import { Request } from "express";
import { Player } from "../players/players.entity";

declare module "express" {
  export interface Request {
    user?: Player;
  }
}

export type TokenPayload = { username: string };
