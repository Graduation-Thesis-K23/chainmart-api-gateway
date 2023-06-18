import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CartsService } from "./carts.service";
import { CartsController } from "./carts.controller";
import { Cart } from "./entities/cart.entity";
import { CartDetail } from "./entities/cart-detail.entity";
import { User } from "~/users/entities/user.entity";
import { Product } from "~/products/entities/product.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartDetail, User, Product])],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
