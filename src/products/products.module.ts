import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { ErrorsModule } from "~/errors/errors.module";
import { S3Module } from "~/s3/s3.module";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "PRODUCT_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "product",
            brokers: ["localhost:9092"],
          },
          consumer: {
            groupId: "product-consumer",
          },
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
