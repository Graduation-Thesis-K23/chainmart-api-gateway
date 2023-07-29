import { Column, Entity } from "typeorm";

import { BaseEntity } from "~/common/base.entity";

@Entity()
export class Branch extends BaseEntity {
  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column()
  ward: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column({ type: "boolean", default: true })
  active: boolean;
}
