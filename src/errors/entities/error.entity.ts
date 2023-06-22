import { Column, Entity } from "typeorm";
import { BaseEntity } from "~/common/base.entity";

@Entity("errors")
export class ErrorEntity extends BaseEntity {
  constructor(message: string, type: string) {
    super();
    this.message = message;
    this.type = type;
  }

  @Column()
  message: string;

  @Column()
  type: string;
}
