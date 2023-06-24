import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { Branch } from "~/branch/entities/branch.entity";
import { BaseEntity } from "~/common/base.entity";
import { Employee } from "~/employee/entities/employee.entity";
import { Product } from "~/products/entities/product.entity";

@Entity("batches")
export class Batch extends BaseEntity {
  @Column()
  batch_code: string;

  @Column({ nullable: true })
  product_id: string;

  @ManyToOne(() => Product, (product) => product.id)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "int" })
  import_quantity: number;

  @Column({ type: "decimal" })
  import_cost: number;

  @Column({ type: "int" })
  acceptable_expiry_threshold: number;

  @Column({ nullable: true })
  branch_id: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: "branch_id" })
  branch: Branch;

  @Column({ type: "int", default: 0 })
  sold: number;

  @Column({ nullable: true })
  employee_create_id: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: "employee_create_id" })
  employee_create: Employee;
}
