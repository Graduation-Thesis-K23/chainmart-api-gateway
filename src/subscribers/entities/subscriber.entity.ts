import { Column, Entity } from "typeorm";
import { BaseEntity } from "~/common/base.entity";

@Entity("subscribers")
export class Subscriber extends BaseEntity {
  @Column({
    unique: true,
  })
  email: string;
}
