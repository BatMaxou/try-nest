import "dotenv/config";
import { DataSource } from "typeorm";

const env = (key: string) => process.env[key];

export default new DataSource({
  type: "postgres",
  host: env("DATABASE_HOST"),
  port: Number(env("DATABASE_PORT")),
  username: env("DATABASE_USERNAME"),
  password: env("DATABASE_PASSWORD"),
  database: env("DATABASE_NAME"),
  synchronize: true,
  entities: ["src/**/*.entity.ts"],
});
