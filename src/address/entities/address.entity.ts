import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { BaseEntity } from "../../common/base.entity";
import { User } from "src/users/entities/user.entity";

@Entity("address")
export class Address extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.username, {
    onUpdate: "NO ACTION",
    onDelete: "NO ACTION",
    nullable: false,
    eager: false,
  })
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: string;

  @Column()
  phone: string;

  @Column({default: false})
  hasPhoneVerify: boolean;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column()
  ward: string;

  @Column()
  street: string;

  @Column({ nullable: true })
  phoneOTP: string;

  @Column({ type: "timestamptz", nullable: true })
  expiryPhoneOTP: Date;
}
