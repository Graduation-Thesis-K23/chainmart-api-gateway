import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BatchesService } from "./batches.service";
import { BatchesController } from "./batches.controller";
import { Batch } from "./entities/batch.entity";
import { Employee } from "~/employee/entities/employee.entity";
import { User } from "~/users/entities/user.entity";
import { Product } from "~/products/entities/product.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Batch, Employee, User, Product])],
  controllers: [BatchesController],
  providers: [BatchesService],
})
export class BatchesModule {}
