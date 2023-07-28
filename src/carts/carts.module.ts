import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CartsService } from "./carts.service";
import { CartsController } from "./carts.controller";
import { Cart } from "./entities/cart.entity";
import { User } from "~/users/entities/user.entity";
import { ProductsModule } from "~/products/products.module";

@Module({
  imports: [TypeOrmModule.forFeature([Cart, User]), ProductsModule],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
