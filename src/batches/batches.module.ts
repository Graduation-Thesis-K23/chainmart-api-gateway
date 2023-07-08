import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BatchesService } from "./batches.service";
import { BatchesController } from "./batches.controller";
import { Batch } from "./entities/batch.entity";
import { ProductsModule } from "~/products/products.module";

@Module({
  imports: [TypeOrmModule.forFeature([Batch]), ProductsModule],
  controllers: [BatchesController],
  providers: [BatchesService],
})
export class BatchesModule {}
