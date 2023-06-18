import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { Product } from "~/products/entities/product.entity";
import { Cart } from "./cart.entity";

// Resources:
// https://github.com/typeorm/typeorm/issues/1224
// https://stackoverflow.com/questions/60978591

@Entity("cart_details")
export class CartDetail {
  @PrimaryColumn()
  cart_id: string;

  @PrimaryColumn()
  product_id: string;

  @ManyToOne(() => Cart, (cart) => cart.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "cart_id" })
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.id)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column()
  quantity: number;
}
