import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Player } from "./players.entity";

type PublicPlayer = Pick<Player, "identifier" | "username" | "avatar">;

@Injectable()
export class PlayerPrivacyInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<PublicPlayer | PublicPlayer[]> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (Array.isArray(data)) {
          return data.map((item: unknown) => {
            if (item instanceof Player) {
              return this.#getPublicData(item);
            }

            throw new Error("Invalid context call of PlayerPrivacyInterceptor");
          });
        }

        if (data instanceof Player) {
          return this.#getPublicData(data);
        }

        throw new Error("Invalid context call of PlayerPrivacyInterceptor");
      }),
    );
  }

  #getPublicData(player: Player): PublicPlayer {
    const { identifier, username, avatar } = player;

    return {
      identifier,
      username,
      avatar,
    };
  }
}
