import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

import { SuppliersController } from "./suppliers.controller";
import { SuppliersService } from "./suppliers.service";
import { Supplier } from "./entities/supplier.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
