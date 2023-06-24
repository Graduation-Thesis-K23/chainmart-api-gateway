import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["log", "error", "warn", "debug", "verbose"] });

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<number>("PORT") || 3000;
  const clientUrl = configService.get<string>("CLIENT_URL");
  const managerUrl = configService.get<string>("MANAGER_URL");
  const branchUrl = configService.get<string>("BRANCH_URL");

  app.setGlobalPrefix("/api");

  app.enableCors({
    origin: [clientUrl, managerUrl, branchUrl],
    credentials: true,
  });
  app.use(cookieParser());

  app.use(
    session({
      secret: configService.get<string>("SESSION_SECRET"),
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(port, () => console.log(`App running at port: ${port}`));
}

bootstrap();
