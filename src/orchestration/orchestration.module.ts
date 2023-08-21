import { Module } from "@nestjs/common";
import { OrchestrationController } from "./orchestration.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "ORCHESTRATION_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService) => {
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: "orchestration-api",
                brokers: configService.get("KAFKA_BROKERS").split(","),
              },
              consumer: {
                groupId: "orchestration-consumer",
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [OrchestrationController],
})
export class OrchestrationModule {}
