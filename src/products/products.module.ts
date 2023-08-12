import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { ErrorsModule } from "~/errors/errors.module";
import { S3Module } from "~/s3/s3.module";
import { CommentsModule } from "~/comments/comments.module";
import { BatchesModule } from "~/batches/batches.module";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "PRODUCT_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService) => {
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
      {
        name: "BATCH_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService) => {
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: "batch-1",
                brokers: configService.get("KAFKA_BROKERS").split(","),
              },
              consumer: {
                groupId: "batch-consumer",
              },
            },
          };
        },
      },
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        name: "RATE_SERVICE",
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: "product-rate",
              brokers: configService.get("KAFKA_BROKERS").split(","),
            },
            consumer: {
              groupId: "rates-consumer",
            },
          },
        }),
      },
    ]),
    ErrorsModule,
    S3Module,
    CommentsModule,
    BatchesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
