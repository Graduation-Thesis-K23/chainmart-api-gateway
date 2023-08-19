import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";
import { WinstonModule } from "nest-winston";

import { AppModule } from "./app.module";
import { winstonConfig } from "./config/winston.config";

async function bootstrap() {
  const logger = new Logger("HTTP");

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<number>("PORT") || 3000;
  const clientUrl = configService.get("CLIENT_URL");
  const managerUrl = configService.get("CUSTOMER_URL");
  const adminUrl = configService.get("ADMIN_URL");
  const branchUrl = configService.get("BRANCH_URL");
  const employeeUrl = configService.get("EMPLOYEE_URL");

  app.setGlobalPrefix("/api");

  app.enableCors({
    origin: [clientUrl, managerUrl, branchUrl, adminUrl, employeeUrl, "*"],
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

  await app.listen(port, () => logger.log(`Chainmart-be running at port: ${port}`));
}

bootstrap();
