import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, MoreThanOrEqual, Repository } from "typeorm";
import * as moment from "moment";

import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { Order } from "./entities/order.entity";
import { User } from "~/users/entities/user.entity";
import { Batch } from "~/batches/entities/batch.entity";
import { ProductsService } from "~/products/products.service";

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Batch)
    private readonly batchRepostiory: Repository<Batch>,

    private readonly productService: ProductsService,
  ) {}

  async create(username: string, createOrderDto: CreateOrderDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const batchesUpdateProcesses = createOrderDto.order_details.map(async ({ product_id, quantity }) => {
        await this.updateBatchesByOrderDetails(queryRunner.manager, product_id, quantity);
      });
      await Promise.all(batchesUpdateProcesses);

      // Default is the next day
      const estimated_shipped_date = moment().add(1, "days").format("YYYY-MM-DD");
      const order = queryRunner.manager.create(Order, {
        ...createOrderDto,
        estimated_shipped_date,
      });
      await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();

      return order;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error(err);
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  private async updateBatchesByOrderDetails(transactionManager: EntityManager, product_id: string, quantity: number) {
    const product = await this.productService.findById(product_id);

    const neverExpiryThreshold = 356 * 100; // 100 years
    const expiryDate = moment()
      .add(product.acceptable_expiry_threshold || neverExpiryThreshold, "days")
      .format("YYYY-MM-DD");
    const batches = await transactionManager.find(Batch, {
      where: {
        product_id,
        expiry_date: MoreThanOrEqual(expiryDate),
      },
      order: {
        expiry_date: "ASC",
      },
    });
    if (batches.length === 0) {
      throw new Error("Cannot found any batch");
    }

    const totalQuantityInBatch = batches.reduce((prev, curr) => prev + (curr.import_quantity - curr.sold), 0);
    if (totalQuantityInBatch < quantity) {
      throw new Error("Not sufficient quantity");
    }

    let requiredQuantity = quantity;
    for (const batch of batches) {
      const batchRemainQuantity = batch.import_quantity - batch.sold;
      const consumed = Math.min(requiredQuantity, batchRemainQuantity);

      await transactionManager.update(Batch, batch.id, {
        sold: batch.sold + consumed,
      });

      requiredQuantity -= consumed;
      if (requiredQuantity === 0) {
        break;
      }
    }
  }

  async findAll(): Promise<Order[]> {
    try {
      return await this.orderRepository.find({
        relations: {
          user: true,
          order_details: true,
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
      return await this.orderRepository.find({
        relations: {
          user: true,
          order_details: true,
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
      return await this.orderRepository.findOne({
        where: {
          id,
        },
        relations: {
          user: true,
          order_details: true,
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
