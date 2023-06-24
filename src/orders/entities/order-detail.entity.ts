import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { Product } from "src/products/entities/product.entity";
import { Order } from "./order.entity";

// Resources:
// https://github.com/typeorm/typeorm/issues/1224
// https://stackoverflow.com/questions/60978591

@Entity("order_details")
export class OrderDetail {
  @PrimaryColumn()
  order_id: string;

  @PrimaryColumn()
  product_id: string;

  @ManyToOne(() => Order, (order) => order.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Product, (product) => product.id)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column()
  quantity: number;
}
