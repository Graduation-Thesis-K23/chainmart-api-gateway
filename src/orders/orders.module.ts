import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { Order } from "./entities/order.entity";
import { OrderDetail } from "./entities/order-detail.entity";
import { User } from "~/users/entities/user.entity";
import { Batch } from "~/batches/entities/batch.entity";
import { ProductsModule } from "~/products/products.module";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail, User, Batch]), ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
