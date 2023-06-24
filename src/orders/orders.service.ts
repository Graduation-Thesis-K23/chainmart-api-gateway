import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { Order } from "./entities/order.entity";
import { User } from "~/users/entities/user.entity";
import { Product } from "~/products/entities/product.entity";
import { Batch } from "~/batches/entities/batch.entity";

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Batch)
    private readonly batchRepostiory: Repository<Batch>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ id: createOrderDto.user_id });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const quantityCheckResults = await Promise.all(
        createOrderDto.order_details.map(async ({ product_id, quantity }) => {
          const { total_quantity } = await this.batchRepostiory
            .createQueryBuilder("batches")
            .select("SUM(batches.import_quantity)::int", "total_quantity")
            .where("product_id = :product_id", { product_id })
            .getRawOne();

          if (total_quantity < quantity) {
            return Promise.reject(false);
          }

          return Promise.resolve(true);
        }),
      );

      await queryRunner.commitTransaction();

      return "created";
    } catch (err) {
      await queryRunner.rollbackTransaction();

      console.error(err);
      throw new BadRequestException("Cannot create order");
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    try {
      return this.orderRepository.find({
        relations: {
          user: true,
          order_details: {
            product: true,
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Cannot find orders");
    }
  }

  async findOne(id: string): Promise<Order> {
    try {
      return this.orderRepository.findOne({
        where: {
          id,
        },
        relations: {
          user: true,
          order_details: {
            product: true,
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot find order with id(${id})`);
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      return `This action updates a #${id} order`;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot update order with id(${id})`);
    }
  }

  async remove(id: string): Promise<string> {
    try {
      const result = await this.orderRepository.softDelete(id);

      if (result.affected === 0) {
        throw new BadRequestException(`Order with id(${id}) not found`);
      }

      return `Order with id(${id}) have been deleted`;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot delete order with id(${id})`);
    }
  }
}
