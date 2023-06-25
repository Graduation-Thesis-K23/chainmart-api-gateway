import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, VirtualColumn } from "typeorm";

import { BaseEntity } from "src/common/base.entity";
import { User } from "src/users/entities/user.entity";
import { Address } from "src/address/entities/address.entity";
import { OrderStatus, Payment } from "src/shared";
import { OrderDetail } from "./order-detail.entity";

@Entity("orders")
export class Order extends BaseEntity {
  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: true })
  address_id: string;

  @OneToOne(() => Address)
  @JoinColumn({ name: "address_id" })
  address: Address;

  @Column({ type: "date" })
  estimated_shipped_date: string;

  @Column({ type: "date", nullable: true })
  shipped_date: string;

  @Column({ type: "date", nullable: true })
  approved_date: string;

  @Column({ type: "date", nullable: true })
  return_date: string;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.Processing,
  })
  status: OrderStatus;

  @Column({
    type: "enum",
    enum: Payment,
    default: Payment.Cash,
  })
  payment: Payment;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, {
    cascade: true,
  })
  order_details: OrderDetail[];

  @VirtualColumn({
    query: (alias) => `
      SELECT SUM("order_details".quantity * "products".price) 
      FROM "order_details" 
      LEFT JOIN "products" ON "products".id = "order_details".product_id
      WHERE "order_details".order_id = ${alias}.id
    `,
  })
  total: number;
}
