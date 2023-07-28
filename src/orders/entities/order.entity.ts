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

  @Column({ type: "timestamptz", nullable: true })
  approved_date: Date;

  @Column({ nullable: true })
  approved_by: string;

  @Column({ type: "timestamptz", nullable: true })
  packaged_date: Date;

  @Column({ nullable: true })
  packaged_by: string;

  @Column({ type: "timestamptz", nullable: true })
  started_date: Date;

  @Column({ nullable: true })
  started_by: string;

  @Column({ type: "timestamptz", nullable: true })
  completed_date: Date;

  @Column({ nullable: true })
  completed_by: string;

  @Column({ type: "timestamptz", nullable: true })
  cancelled_date: Date;

  @Column({ nullable: true })
  cancelled_by: string;

  @Column({ type: "timestamptz", nullable: true })
  returned_date: Date;

  @Column({ nullable: true })
  returned_by: string;

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
