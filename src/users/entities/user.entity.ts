import { Entity, Column, BeforeInsert, AfterLoad, BeforeUpdate } from "typeorm";
import * as bcrypt from "bcrypt";

import { BaseEntity } from "../../common/base.entity";
import { Role } from "../enums/role.enum";
import { Gender } from "../enums/gender.enum";

@Entity("users")
export class User extends BaseEntity {
  private tempPassword: string;

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

  @Column({ type: "timestamptz", nullable: true })
  birthday: Date;

  @Column({ type: "enum", enum: Gender, nullable: true })
  gender: string;

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

  @AfterLoad()
  private async generateTempPassword() {
    this.tempPassword = this.password;
  }

  @BeforeUpdate()
  private async hashNewPassword() {
    if (this.tempPassword !== this.password) {
      const saltOrRounds = 10;
      const password = this.password;
      const hashed = await bcrypt.hash(password, saltOrRounds);
      this.password = hashed;
    }
  }
}
