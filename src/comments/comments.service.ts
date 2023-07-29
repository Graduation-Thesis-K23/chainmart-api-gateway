import { Injectable, forwardRef, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, In, Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { UsersService } from "~/users/users.service";
import { ProductsService } from "~/products/products.service";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    private readonly usersService: UsersService,

    @Inject(forwardRef(() => ProductsService))
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

  /* averageStar: number;
  numberOfComment: number;
  numberOfOneStar: number;
  numberOfTwoStar: number;
  numberOfThreeStar: number;
  numberOfFourStar: number;
  numberOfFiveStar: number; */

  async getCommentsByProduct(product_id: string) {
    const comments = await this.commentRepository.find({
      where: {
        product_id,
      },
      relations: {
        user: true,
      },
      order: {
        created_at: "DESC",
      },
    });

    const numberOfComment = comments.length;

    const averageStar = comments.reduce((acc, comment) => acc + comment.star, 0) / numberOfComment;

    const numberOfOneStar = comments.filter((comment) => comment.star === 1).length;
    const numberOfTwoStar = comments.filter((comment) => comment.star === 2).length;
    const numberOfThreeStar = comments.filter((comment) => comment.star === 3).length;
    const numberOfFourStar = comments.filter((comment) => comment.star === 4).length;
    const numberOfFiveStar = comments.filter((comment) => comment.star === 5).length;

    return {
      averageStar,
      numberOfComment,
      numberOfOneStar,
      numberOfTwoStar,
      numberOfThreeStar,
      numberOfFourStar,
      numberOfFiveStar,
      comments,
    };
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

  async getAverageStarByProducts(ids: string[]) {
    const comments = await this.commentRepository.find({
      where: {
        product_id: In(ids),
      },
      select: ["product_id", "star"],
    });

    const averageStarByProducts = comments.reduce((acc, comment) => {
      if (acc[comment.product_id]) {
        acc[comment.product_id].push(comment.star);
      } else {
        acc[comment.product_id] = [comment.star];
      }

      return acc;
    }, {});

    const result = ids.reduce((acc, id) => {
      if (!averageStarByProducts[id]) {
        return acc;
      }

      const averageStar =
        averageStarByProducts[id].reduce((acc, star) => acc + star, 0) / averageStarByProducts[id].length;

      acc[id] = averageStar;

      return acc;
    }, {});

    return result;
  }

  async getAverageStarByProduct(id: string) {
    const comments = await this.commentRepository.find({
      where: {
        product_id: id,
      },
      select: ["star"],
    });

    return (
      comments.reduce((acc, comment) => {
        return acc + comment.star;
      }, 0) / comments.length
    );
  }
}
