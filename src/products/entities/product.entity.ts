import { Check, Column, Entity, ManyToOne } from "typeorm";

import { BaseEntity } from "src/common/base.entity";
import { Category } from "src/categories/entities/category.entity";
import { Supplier } from "src/suppliers/entities/supplier.entity";

@Entity("products")
@Check('"quantity" >= 0')
@Check('"price" > 0')
@Check('"expiry_date" > NOW()')
@Check('"units_in_stocks" > 0 AND "units_in_stocks" <= "quantity" - "units_on_orders"')
@Check('"units_on_orders" > 0 AND "units_on_orders" <= "quantity" - "units_in_stocks"')
@Check('"sale" > 0 AND "sale" < 100')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.id, {
    onUpdate: "NO ACTION",
    onDelete: "NO ACTION",
    nullable: false,
  })
  supplier: string;

  @ManyToOne(() => Category, (category) => category.id, {
    onUpdate: "NO ACTION",
    onDelete: "NO ACTION",
    nullable: false,
  })
  category: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column()
  expiry_date: Date;

  @Column()
  units_in_stocks: number;

  @Column()
  units_on_orders: number;

  @Column({ nullable: true, comment: "Percentage sale" })
  sale: number;
}
