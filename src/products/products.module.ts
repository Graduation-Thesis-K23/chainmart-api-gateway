import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { Product } from "./entities/product.entity";
import { S3Module } from "../s3/s3.module";
import { ErrorsModule } from "~/errors/errors.module";

@Module({
  imports: [TypeOrmModule.forFeature([Product]), S3Module, ErrorsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
