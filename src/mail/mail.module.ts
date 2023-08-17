import { Module } from "@nestjs/common";

import { MailService } from "./mail.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "EMAIL_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService) => {
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: "email-api",
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
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
