import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { UsersService } from "~/users/users.service";
import { ProductsService } from "~/products/products.service";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    private readonly usersService: UsersService,

    private readonly productService: ProductsService,
  ) {}

  async create(createCommentDto: DeepPartial<Comment>) {
    const newComment = this.commentRepository.create(createCommentDto);

    return await this.commentRepository.save(newComment);
  }

  async getCommentsByUser(username: string) {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      throw new Error("User not found");
    }

    const comments = await this.commentRepository.find({
      where: {
        user_id: user.id,
      },
      order: {
        created_at: "DESC",
      },
    });

    const ids = comments.map((comment) => comment.product_id);

    const products = await this.productService.findByIds(ids);

    return comments.map((comment) => {
      const product = products.find((product) => product.id === comment.product_id);

      return {
        ...comment,
        product: {
          ...product,
          image: product.images[0],
        },
      };
    });
  }

  async getCommentsByProduct(orderId: string) {
    return await this.commentRepository.find({
      where: {
        order_id: orderId,
      },
      order: {
        created_at: "DESC",
      },
    });
  }

  async getCommentsByOrder(username: string, orderId: string) {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      throw new Error("User not found");
    }

    const comments = await this.commentRepository.find({
      where: {
        user_id: user.id,
        order_id: orderId,
      },
      order: {
        created_at: "DESC",
      },
    });

    const ids = comments.map((comment) => comment.product_id);

    const products = await this.productService.findByIds(ids);

    return comments.map((comment) => {
      const product = products.find((product) => product.id === comment.product_id);

      return {
        ...comment,
        product,
        image: product.images[0],
      };
    });
  }
}
