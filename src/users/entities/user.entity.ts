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

  @Column({ nullable: true })
  password: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ default: false })
  hasPhoneVerify: boolean;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ default: false })
  hasEmailVerify: boolean;

  @Column({ unique: true, nullable: true })
  facebook: string;

  @Column({ default: false })
  hasFacebookVerify: boolean;

  @Column({ type: "enum", enum: Gender, default: Gender.Custom })
  gender: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ type: "date", nullable: true })
  birthday: Date;

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
      const hashed = await bcrypt.hash(this.password, saltOrRounds);
      this.password = hashed;
    }
  }
}
