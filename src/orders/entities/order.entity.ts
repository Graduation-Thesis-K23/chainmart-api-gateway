import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";

import { BaseEntity } from "src/common/base.entity";
import { User } from "src/users/entities/user.entity";
import { Address } from "src/address/entities/address.entity";
import { OrderStatus, Payment } from "src/shared";
import { OrderDetail } from "./order-detail.entity";

@Entity("orders")
export class Order extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToOne(() => Address)
  @JoinColumn({ name: "address_id" })
  address: Address;

  @Column()
  discount: number;

  @Column()
  total: number;

  @Column({ type: "date" })
  estimated_shipped_date: string;

  @Column({ type: "date" })
  shipped_date: string;

  @Column({ type: "date" })
  order_date: string;

  @Column({ type: "date" })
  approve_date: string;

  @Column({ type: "date" })
  return_date: string;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.Processing,
  })
  status: OrderStatus;

  @ManyToOne(() => User)
  Employee: User;

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
}
