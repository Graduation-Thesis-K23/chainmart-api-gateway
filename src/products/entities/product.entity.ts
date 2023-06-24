import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

import { BaseEntity } from "../../common/base.entity";
import { Supplier } from "../../suppliers/entities/supplier.entity";
import { Batch } from "~/batches/entities/batch.entity";

@Entity("products")
@Check('"price" > 0')
@Check('"sale" > 0 AND "sale" < 100')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  product_code: string;

  @Column()
  category: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  sale: number;

  @Column("text", { array: true })
  images: string[];

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: "supplier_id" })
  supplier: Supplier;

  @Column()
  specifications: string;

  @Column()
  description: string;

  @Column({ unique: true, type: "text", nullable: false })
  slug: string;

  @OneToMany(() => Batch, (batch) => batch.product)
  batches: Batch[];
}
