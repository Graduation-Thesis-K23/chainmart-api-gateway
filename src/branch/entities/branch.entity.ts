import { Column, Entity } from "typeorm";

import { BaseEntity } from "../../common/base.entity";

@Entity()
export class Branch extends BaseEntity {
  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  address: string;

  @Column()
  district: string;

  @Column()
  phone: string;
}
