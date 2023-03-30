import { Entity, Column } from "typeorm";

import { BaseEntity } from "src/common/base.entity";

@Entity("categories")
export class Category extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}
