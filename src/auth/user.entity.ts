import { Entity, Column } from "typeorm";

import { BaseEntity } from "../common/base.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  username?: string;

  @Column({ unique: true, nullable: true })
  phone?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  dateOfBirth?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  isActive?: boolean;
}
