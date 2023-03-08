import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<number>("PORT") || 3000;
  const clientUrl = configService.get<string>("CLIENT_URL");

  app.setGlobalPrefix("/api", {
    exclude: [],
  });
  app.enableCors({
    origin: [clientUrl, "http://localhost:8080"],
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
