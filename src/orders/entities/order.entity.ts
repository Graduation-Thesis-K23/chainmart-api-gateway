import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

import { BaseEntity } from "src/common/base.entity";
import { User } from "src/users/entities/user.entity";
import { Address } from "src/address/entities/address.entity";
import { OrderStatus, Payment } from "src/shared";
import { OrderDetail } from "./order-detail.entity";

@Entity("orders")
export class Order extends BaseEntity {
  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  address_id: string;

  @ManyToOne(() => Address)
  @JoinColumn({ name: "address_id" })
  address: Address;

  @Column({ type: "date" })
  estimated_shipped_date: string;

  @Column({ type: "date", nullable: true })
  approved_date: string;

  @Column({ type: "date", nullable: true })
  packaged_date: string;

  @Column({ type: "date", nullable: true })
  started_date: string;

  @Column({ type: "date", nullable: true })
  completed_date: string;

  @Column({ type: "date", nullable: true })
  cancelled_date: string;

  @Column({ type: "date", nullable: true })
  returned_date: string;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.Created,
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
}
