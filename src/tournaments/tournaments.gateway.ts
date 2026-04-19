import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { TournamentStatus } from "./tournaments.enum";

export type TournamentStatusChangedPayload = {
  identifier: string;
  from: TournamentStatus;
  to: TournamentStatus;
  at: string;
};

const room = (identifier: string) => `tournament:${identifier}`;

@WebSocketGateway({ namespace: "/tournaments", cors: true })
export class TournamentsGateway {
  @WebSocketServer()
  public server: Server;

  @SubscribeMessage("tournament:subscribe")
  public async onSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() identifier: string,
  ) {
    await client.join(room(identifier));

    return { subscribed: identifier };
  }

  public emitStatusChanged(
    identifier: string,
    from: TournamentStatus,
    to: TournamentStatus,
  ) {
    const payload: TournamentStatusChangedPayload = {
      identifier,
      from,
      to,
      at: new Date().toISOString(),
    };

    this.server.to(room(identifier)).emit("tournament:status-changed", payload);
  }
}
