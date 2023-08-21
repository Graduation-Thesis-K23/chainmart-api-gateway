import { ConsoleLogger, Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { TerminusModule } from "@nestjs/terminus";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: "pretty",
      logger: ConsoleLogger,
    }),
    HttpModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
