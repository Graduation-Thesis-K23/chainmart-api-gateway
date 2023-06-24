import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { Order } from "./entities/order.entity";
import { OrderDetail } from "./entities/order-detail.entity";
import { User } from "~/users/entities/user.entity";
import { Product } from "~/products/entities/product.entity";
import { Batch } from "~/batches/entities/batch.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail, User, Product, Batch])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
