import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: "games",
})
export class Game {
  @PrimaryGeneratedColumn("uuid")
  public identifier: string;

  @Column()
  public name: string;

  @Column()
  public publisher: string;

  @Column()
  public releaseDate: Date;

  @Column()
  public genre: string;
}
