import { Column, Entity, BeforeInsert, AfterLoad, BeforeUpdate } from "typeorm";
import * as bcrypt from "bcrypt";

import { BaseEntity } from "../../common/base.entity";
import { Role } from "../../shared";
import { Exclude } from "class-transformer";

@Entity("employees")
export class Employee extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  title: string;

  @Column()
  branchId: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ type: "enum", default: Role.Employee, enum: Role, nullable: false })
  role: Role;

  @Exclude()
  private tempPassword: string;

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
