import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { BaseEntity } from "~/common/base.entity";
import { User } from "~/users/entities/user.entity";

@Entity("carts")
export class Cart extends BaseEntity {
  @PrimaryColumn()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  /* @OneToMany(() => CartDetail, (cartDetail) => cartDetail.cart, {
    cascade: true,
  })
  cart_details: CartDetail[]; */

  @PrimaryColumn()
  product_id: string;

  @Column()
  quantity: number;
}
