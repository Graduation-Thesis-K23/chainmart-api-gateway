import { Column, Entity, OneToMany } from "typeorm";

import { Batch } from "~/batches/entities/batch.entity";
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

  @OneToMany(() => Batch, (batch) => batch.branch)
  batchs: Batch[];
}
