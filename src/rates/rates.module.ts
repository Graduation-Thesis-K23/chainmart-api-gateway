import { Module } from "@nestjs/common";
import { RatesService } from "./rates.service";
import { RatesController } from "./rates.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "RATE_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService) => {
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: "rate",
                brokers: configService.get("KAFKA_BROKERS").split(","),
              },
              consumer: {
                groupId: "rate-consumer",
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [RatesController],
  providers: [RatesService],
})
export class RatesModule {}
