import { Entity, Column } from "typeorm";

import { BaseEntity } from "src/common/base.entity";

@Entity()
export class Category extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;
}
