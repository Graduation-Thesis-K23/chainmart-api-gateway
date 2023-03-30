import { Column, Entity } from "typeorm";

import { BaseEntity } from "src/common/base.entity";

@Entity("suppliers")
export class Supplier extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  homepage: string;

  @Column({ nullable: true })
  postal_code: string;
}
