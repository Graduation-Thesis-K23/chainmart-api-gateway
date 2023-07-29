import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "~/common/base.entity";
import { User } from "~/users/entities/user.entity";

@Entity("comments")
export class Comment extends BaseEntity {
  @Column()
  order_id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  product_id: string;

  @Column({ nullable: true })
  comment: string;

  @Column()
  star: number;

  @Column({
    nullable: true,
    type: "text",
    array: true,
  })
  images: string[];
}
