import { IProcessor } from "typeorm-fixtures-cli";
import { hashSync } from "bcryptjs";

import { Player } from "../../src/players/players.entity";

export default class PlayerProcessor implements IProcessor<Player> {
  preProcess(name: string, object: Player): Player {
    return { ...object, password: hashSync(object.password, 10) };
  }

  postProcess(): void {}
}
