import { Column, Entity, BeforeInsert, AfterLoad, BeforeUpdate, ManyToOne, JoinColumn } from "typeorm";
import * as bcrypt from "bcrypt";
import { Exclude } from "class-transformer";

import { BaseEntity } from "../../common/base.entity";
import { Role } from "../../shared";
import { Branch } from "~/branch/entities/branch.entity";

@Entity("employees")
export class Employee extends BaseEntity {
  constructor(partial: Partial<Employee>) {
    super();
    Object.assign(this, partial);
  }

  @Column()
  name: string;

  @Column({ nullable: true })
  branch_id: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: "branch_id" })
  branch: Branch;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column({ type: "enum", default: Role.Employee, enum: Role, nullable: false })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

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
