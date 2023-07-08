import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";

config({
  path: process.env.STAGE === "dev" ? ".env.dev" : ".env",
});

const configService = new ConfigService();

const dataSource = new DataSource({
  type: "postgres",
  host: configService.get<string>("DB_HOST"),
  port: +configService.get<number>("DB_PORT"),
  username: configService.get<string>("DB_USERNAME"),
  password: configService.get<string>("DB_PASSWORD"),
  database: configService.get<string>("DB_DATABASE"),
  synchronize: false,
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
});

export default dataSource;
