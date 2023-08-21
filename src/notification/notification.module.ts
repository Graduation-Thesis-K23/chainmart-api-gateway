import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "NOTIFICATION_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService) => {
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: "notification-api",
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
  controllers: [NotificationController],
})
export class NotificationModule {}
