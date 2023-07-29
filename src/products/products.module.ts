import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { ErrorsModule } from "~/errors/errors.module";
import { S3Module } from "~/s3/s3.module";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "PRODUCT_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService) => {
          console.log(configService.get("KAFKA_BROKERS").split(","));
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: "product",
                brokers: configService.get("KAFKA_BROKERS").split(","),
              },
              consumer: {
                groupId: "product-consumer",
              },
            },
          };
        },
      },
    ]),
    ErrorsModule,
    S3Module,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
