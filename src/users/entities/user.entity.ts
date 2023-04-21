import { Entity, Column, BeforeInsert } from "typeorm";
import * as bcrypt from "bcrypt";

import { BaseEntity } from "../../common/base.entity";
import { Role } from "../enums/role.enum";

@Entity("users")
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.User,
  })
  role: Role;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  facebook: boolean;

  @Column({ default: false })
  google: boolean;

  @Column({ nullable: true })
  phone: string;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    const saltOrRounds = 10;
    const password = this.password;
    const hashed = await bcrypt.hash(password, saltOrRounds);
    this.password = hashed;
  }
}
