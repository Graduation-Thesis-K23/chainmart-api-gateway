import { Column, BeforeInsert, Entity, ManyToOne, JoinColumn } from "typeorm";
import * as bcrypt from "bcrypt";

import { BaseEntity } from "../../common/base.entity";
import { Role } from "../../shared";
import { Branch } from "../../branch/entities/branch.entity";

@Entity("employee")
export class Employee extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => Branch, (branch) => branch.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "branchId" })
  branchId: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  photo: string;

  // You can get this column https://typeorm.io/select-query-builder#hidden-columns
  @Column({ select: false })
  password: string;

  @Column({ type: "enum", enum: Role, default: Role.Employee })
  role: string;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    const saltOrRounds = 10;
    const password = this.password;
    const hashed = await bcrypt.hash(password, saltOrRounds);
    this.password = hashed;
  }
}
