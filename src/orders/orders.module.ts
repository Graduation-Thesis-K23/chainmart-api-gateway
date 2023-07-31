import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "ORDER_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService) => {
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: "order",
                brokers: configService.get("KAFKA_BROKERS").split(","),
              },
              consumer: {
                groupId: "order-consumer",
              },
            },
          };
        },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
