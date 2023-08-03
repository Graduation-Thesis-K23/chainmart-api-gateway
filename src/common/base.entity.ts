import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn } from "typeorm";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ select: false, type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ select: false, type: "timestamptz" })
  deleted_at: Date;
}
