import { Module } from "@nestjs/common";

import { PhoneService } from "./phone-service.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "PHONE_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService) => {
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: "phone-api",
                brokers: configService.get("KAFKA_BROKERS").split(","),
              },
              consumer: {
                groupId: "notification-consumer",
              },
            },
          };
        },
      },
    ]),
  ],
  providers: [PhoneService],
  exports: [PhoneService],
})
export class PhoneServiceModule {}
