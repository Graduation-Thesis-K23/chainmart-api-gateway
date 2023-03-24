import { Column, Entity } from "typeorm";

import { BaseEntity } from "src/common/base.entity";

@Entity()
export class Supplier extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  homepage: string;

  @Column({ nullable: true })
  postal_code: string;
}
