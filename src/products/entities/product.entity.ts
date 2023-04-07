import { BeforeInsert, Check, Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { BaseEntity } from "../../common/base.entity";
import { Category } from "../../categories/entities/category.entity";
import { Supplier } from "../../suppliers/entities/supplier.entity";

@Entity("products")
@Check('"quantity" >= 0')
@Check('"price" > 0')
@Check('"units_in_stocks" >= 0 AND "units_in_stocks" <= "quantity" - "units_on_orders"')
@Check('"units_on_orders" >= 0 AND "units_on_orders" <= "quantity" - "units_in_stocks"')
@Check('"sale" > 0 AND "sale" < 100')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.id, {
    onUpdate: "NO ACTION",
    onDelete: "NO ACTION",
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: "supplier_id" })
  supplier: string;

  @ManyToOne(() => Category, (category) => category.id, {
    onUpdate: "NO ACTION",
    onDelete: "NO ACTION",
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: "category_id" })
  category: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column({ type: "timestamptz" })
  expiry_date: Date;

  @Column({ type: "int", default: 0 })
  units_in_stocks: number;

  @Column({ type: "int", default: 0 })
  units_on_orders: number;

  @Column({ nullable: true })
  sale: number;

  @Column()
  description: string;

  @Column({ nullable: true })
  options: string;

  @Column()
  specifications: string;

  @Column({ unique: true, type: "text", nullable: false })
  slug: string;

  @Column()
  images: string;

  @BeforeInsert()
  async convertISOToTimestamp(): Promise<void> {
    const dateISO = this.expiry_date;
    const timestamp = new Date(dateISO);
    this.expiry_date = timestamp;
  }
}
