import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { S3Module } from "~/s3/s3.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "~/users/entities/user.entity";
import { AddressModule } from "~/address/address.module";
import { EmployeeModule } from "~/employee/employee.module";

@Module({
  imports: [
    AddressModule,
    TypeOrmModule.forFeature([User]),
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
                clientId: "orders-api",
                brokers: configService.get("KAFKA_BROKERS").split(","),
              },
              consumer: {
                groupId: "orders-consumer",
              },
            },
          };
        },
      },
    ]),
    S3Module,
    EmployeeModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
