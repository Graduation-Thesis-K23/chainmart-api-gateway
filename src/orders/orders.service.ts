import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, MoreThanOrEqual, Repository } from "typeorm";
import * as moment from "moment";

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
      const batchesUpdateProcesses = createOrderDto.order_details.map(async ({ product_id, quantity }) => {
        const product = await this.productRepository.findOneBy({ id: product_id });
        if (!product) {
          return Promise.reject("Product not found");
        }

        const neverExpiryThreshold = 356 * 100; // 100 years
        const expiryDate = moment()
          .add(product.acceptable_expiry_threshold || neverExpiryThreshold, "days")
          .format("YYYY-MM-DD");
        const batches = await this.batchRepostiory.find({
          where: {
            product_id,
            expiry_date: MoreThanOrEqual(expiryDate),
          },
          order: {
            expiry_date: "ASC",
          },
        });
        if (batches.length === 0) {
          return Promise.reject("Cannot found any batch");
        }

        const totalCurrentQuantity = batches.reduce((prev, curr) => prev + curr.import_quantity, 0);
        if (totalCurrentQuantity < quantity) {
          return Promise.reject("Not sufficient quantity");
        }

        let remainQuantity = quantity;
        for (const batch of batches) {
          const batchRemainQuantity = batch.import_quantity - batch.sold;
          const consumed = Math.min(remainQuantity, batchRemainQuantity);

          await this.batchRepostiory.save({
            ...batch,
            sold: batch.sold + consumed,
          });

          remainQuantity -= consumed;
          if (remainQuantity === 0) {
            break;
          }
        }
      });
      await Promise.all(batchesUpdateProcesses);

      // Default is the next 3 days
      const estimated_shipped_date = moment().add(3, "days").format("YYYY-MM-DD");
      const order = this.orderRepository.create({
        ...createOrderDto,
        estimated_shipped_date,
      });

      await queryRunner.commitTransaction();

      return this.orderRepository.save(order);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error(err);
      throw new BadRequestException(err);
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

  async findAllByUserId(userId: string): Promise<Order[]> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    try {
      return this.orderRepository.find({
        relations: {
          user: true,
          order_details: {
            product: true,
          },
        },
        where: {
          user_id: userId,
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Cannot find orders by user_id");
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
