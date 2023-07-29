import { Column, Entity } from "typeorm";
import { BaseEntity } from "~/common/base.entity";

@Entity("comments")
export class Comment extends BaseEntity {
  @Column()
  order_id: string;

  @Column()
  user_id: string;

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
