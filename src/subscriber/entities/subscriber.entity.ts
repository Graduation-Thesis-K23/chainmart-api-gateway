import { Column, Entity } from "typeorm";

import { BaseEntity } from "src/common/base.entity";

@Entity("subscribers")
export class Subscriber extends BaseEntity {
  @Column()
  email: string;
}
