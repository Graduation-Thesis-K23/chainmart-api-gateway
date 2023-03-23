import { Entity, Column } from "typeorm";
import { BaseEntity } from "src/common/base.entity";

@Entity()
export class Category extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;
}
