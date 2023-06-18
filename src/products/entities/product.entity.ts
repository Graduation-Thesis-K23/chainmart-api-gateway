import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

import { BaseEntity } from "../../common/base.entity";
import { Supplier } from "../../suppliers/entities/supplier.entity";
import { CartDetail } from "src/carts/entities/cart-detail.entity";

@Entity("products")
@Check('"price" > 0')
@Check('"sale" > 0 AND "sale" < 100')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column()
  category: string;

  @Column()
  price: number;

  @Column({ type: "int", default: 0 })
  sold: number;

  @Column({ nullable: true })
  sale: number;

  @Column()
  images: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.id, {
    onUpdate: "NO ACTION",
    onDelete: "NO ACTION",
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: "supplier_id" })
  supplier: string;

  @Column({ type: "float", default: 0.0 })
  rating: number;

  @Column({ default: false })
  isHot: boolean;

  @Column()
  specifications: string;

  @Column()
  description: string;

  @Column({ unique: true, type: "text", nullable: false })
  slug: string;

  @Column({ type: "int", default: 0 })
  numberOfComments: number;

  @OneToMany(() => CartDetail, (cartDetail) => cartDetail.product)
  cart_details: CartDetail[];
}
