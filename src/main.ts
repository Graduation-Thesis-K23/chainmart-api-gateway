import { RequestMethod, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<number>("PORT") || 3000;
  const clientUrl = configService.get<string>("CLIENT_URL");
  const managerUrl = configService.get<string>("MANAGER_URL");

  app.setGlobalPrefix("/api", {
    exclude: [
      {
        path: "s3",
        method: RequestMethod.ALL,
      },
    ],
  });
  app.enableCors({
    origin: [clientUrl, managerUrl, "http://localhost:8080"],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(port, () => console.log(`App running at port: ${port}`));
}

bootstrap();
