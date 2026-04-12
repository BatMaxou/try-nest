import { Injectable } from "@nestjs/common";
import { compareSync, hashSync } from "bcryptjs";

@Injectable()
export class PasswordHasherService {
  public createHash(plainPassword: string): string {
    return hashSync(plainPassword, 10);
  }

  public verify(plainPassword: string, hashedPassword: string): boolean {
    return compareSync(plainPassword, hashedPassword);
  }
}
