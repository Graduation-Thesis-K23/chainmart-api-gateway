import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";

import { BaseEntity } from "~/common/base.entity";
import { User } from "~/users/entities/user.entity";
import { CartDetail } from "./cart-detail.entity";

@Entity("carts")
export class Cart extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({
    nullable: true,
  })
  note?: string;

  @OneToMany(() => CartDetail, (cartDetail) => cartDetail.cart, {
    cascade: true,
  })
  cart_details: CartDetail[];
}
