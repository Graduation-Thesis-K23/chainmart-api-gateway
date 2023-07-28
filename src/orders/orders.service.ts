import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, In, Like, MoreThanOrEqual, Repository } from "typeorm";
import * as moment from "moment";

import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { Order } from "./entities/order.entity";
import { User } from "~/users/entities/user.entity";
import { Batch } from "~/batches/entities/batch.entity";
import { ProductsService } from "~/products/products.service";
import { OrderStatus } from "~/shared";

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    private readonly productService: ProductsService,
  ) {}

  async create(username: string, createOrderDto: CreateOrderDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const order = this.orderRepository.create({
      ...createOrderDto,
      user_id: user.id,
    });

    const result = await this.orderRepository.save(order);

    if (result) {
      // clear cart
      this.dataSource.query(`DELETE FROM carts WHERE user_id = '${user.id}'`);
    }

    return result;

    /* const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const batchesUpdateProcesses = createOrderDto.order_details.map(async ({ product_id, quantity }) => {
        await this.updateBatchesByOrderDetails(queryRunner.manager, product_id, quantity);
      });
      await Promise.all(batchesUpdateProcesses);

      const order = queryRunner.manager.create(Order, {
        ...createOrderDto,
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
    } */
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

  async findAll(username: string, status: OrderStatus | "all") {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    if (status === "all") {
      const orders = await this.orderRepository.find({
        relations: {
          order_details: true,
          address: true,
        },
        where: {
          user_id: user.id,
        },
        order: {
          created_at: "DESC",
        },
      });

      const ids = orders.map((order) => order.order_details.map((detail) => detail.product_id)).flat();

      const products = await this.productService.findByIds(ids);

      const result = orders.map((order) => {
        const order_details = order.order_details.map((detail) => {
          const product = products.find((product) => product.id === detail.product_id);
          return {
            ...detail,
            image: product.images[0],
            ...product,
          };
        });
        return {
          ...order,
          order_details,
        };
      });
      return result;
    } else {
      const orders = await this.orderRepository.find({
        relations: {
          order_details: true,
          address: true,
        },
        where: {
          user_id: user.id,
          status,
        },
        order: {
          created_at: "DESC",
        },
      });

      const ids = orders.map((order) => order.order_details.map((detail) => detail.product_id)).flat();

      const products = await this.productService.findByIds(ids);

      const result = orders.map((order) => {
        const order_details = order.order_details.map((detail) => {
          const product = products.find((product) => product.id === detail.product_id);
          return {
            ...detail,
            image: product.images[0],
            ...product,
          };
        });
        return {
          ...order,
          order_details,
        };
      });
      return result;
    }
  }

  async cancelOrder(username: string, orderId: string) {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        user_id: user.id,
      },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (!(order.status === OrderStatus.Created || order.status === OrderStatus.Approved)) {
      throw new BadRequestException("Cannot cancel order");
    }

    order.status = OrderStatus.Cancelled;
    order.cancelled_date = new Date();
    order.cancelled_by = user.id;

    await this.orderRepository.save(order);

    return order;
  }

  async resell(username: string, orderId: string) {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        user_id: user.id,
      },
      relations: {
        order_details: true,
        address: true,
      },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (order.status !== OrderStatus.Completed && order.status !== OrderStatus.Cancelled) {
      throw new BadRequestException("Cannot resell order");
    }

    const { order_details, payment, address_id, user_id, address } = order;
    const newOrder = this.orderRepository.create({
      order_details,
      payment,
      address_id,
      user_id,
    });

    const result = await this.orderRepository.save(newOrder);

    const ids = order_details.map((detail) => detail.product_id);

    const products = await this.productService.findByIds(ids);

    const newOrderDetails = order_details.map((detail) => {
      const product = products.find((product) => product.id === detail.product_id);
      return {
        ...detail,
        image: product.images[0],
        ...product,
      };
    });

    return {
      ...result,
      address,
      order_details: newOrderDetails,
    };
  }

  async getOrdersByEmployee(phone: string, status: OrderStatus | "all", search: string) {
    console.log(phone);

    let orders = await this.orderRepository.find({
      where: {
        status:
          status === "all"
            ? In([
                OrderStatus.Created,
                OrderStatus.Approved,
                OrderStatus.Started,
                OrderStatus.Packaged,
                OrderStatus.Completed,
                OrderStatus.Cancelled,
                OrderStatus.Returned,
              ])
            : status,
      },
      relations: {
        order_details: true,
        address: true,
        user: true,
      },
      order: {
        created_at: "DESC",
      },
    });

    if (search) {
      orders = orders.filter((order) => {
        return (
          order.address.name.toLowerCase().includes(search.toLowerCase()) ||
          order.address.phone.toLowerCase().includes(search.toLowerCase()) ||
          order.address.phone.toLowerCase().includes(search.toLowerCase()) ||
          order.address.name.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    const ids = orders.map((order) => order.order_details.map((detail) => detail.product_id)).flat();

    const products = await this.productService.findByIds(ids);

    const result = orders.map((order) => {
      const order_details = order.order_details.map((detail) => {
        const product = products.find((product) => product.id === detail.product_id);
        return {
          ...detail,
          image: product.images[0],
          ...product,
        };
      });
      return {
        ...order,
        order_details,
      };
    });

    return result;
  }

  async approveOrderByEmployee(phone: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (order.status !== OrderStatus.Created) {
      throw new BadRequestException("Cannot approve order");
    }

    order.status = OrderStatus.Approved;
    order.approved_date = new Date();
    order.approved_by = phone;

    await this.orderRepository.save(order);

    return order;
  }

  async rejectOrderByEmployee(phone: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (order.status !== OrderStatus.Created && order.status !== OrderStatus.Approved) {
      throw new BadRequestException("Cannot reject order");
    }

    order.status = OrderStatus.Cancelled;
    order.cancelled_date = new Date();
    order.cancelled_by = phone;

    await this.orderRepository.save(order);

    return order;
  }

  async startShipmentByEmployee(phone: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: {
        order_details: true,
        address: true,
      },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (order.status !== OrderStatus.Approved) {
      throw new BadRequestException("Cannot start shipment");
    }

    order.status = OrderStatus.Packaged;
    order.packaged_date = new Date();
    order.packaged_by = phone;

    await this.orderRepository.save(order);

    return order;
  }

  // shipper services
  async getOrdersByShipper(phone: string, status: OrderStatus, page: number) {
    console.log(phone);

    const orders = await this.orderRepository.find({
      where: {
        status,
      },
      relations: {
        order_details: true,
        address: true,
        user: true,
      },
      order: {
        created_at: "DESC",
      },
      skip: (page - 1) * 6,
      take: 6,
    });

    const ids = orders.map((order) => order.order_details.map((detail) => detail.product_id)).flat();

    const products = await this.productService.findByIds(ids);

    const result = orders.map((order) => {
      const order_details = order.order_details.map((detail) => {
        const product = products.find((product) => product.id === detail.product_id);
        return {
          ...detail,
          image: product.images[0],
          ...product,
        };
      });
      return {
        ...order,
        order_details,
      };
    });

    return result;
  }

  async startShipmentByShipper(phone: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: {
        order_details: true,
        address: true,
        user: true,
      },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (order.status !== OrderStatus.Packaged) {
      throw new BadRequestException("Cannot start shipment");
    }

    order.status = OrderStatus.Started;
    order.started_date = new Date();
    order.started_by = phone;

    await this.orderRepository.save(order);

    const ids = order.order_details.map((detail) => detail.product_id);

    const products = await this.productService.findByIds(ids);

    const result = {
      ...order,
      order_details: order.order_details.map((detail) => {
        const product = products.find((product) => product.id === detail.product_id);
        return {
          ...detail,
          image: product.images[0],
          ...product,
        };
      }),
    };

    return result;
  }

  async completedOrderByShipper(phone: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: {
        order_details: true,
        address: true,
        user: true,
      },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (order.status !== OrderStatus.Started) {
      throw new BadRequestException("Cannot complete order");
    }

    order.status = OrderStatus.Completed;
    order.completed_date = new Date();
    order.completed_by = phone;

    await this.orderRepository.save(order);

    const ids = order.order_details.map((detail) => detail.product_id);

    const products = await this.productService.findByIds(ids);

    const result = {
      ...order,
      order_details: order.order_details.map((detail) => {
        const product = products.find((product) => product.id === detail.product_id);
        return {
          ...detail,
          image: product.images[0],
          ...product,
        };
      }),
    };

    return result;
  }

  async cancelledOrderByShipper(phone: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: {
        order_details: true,
        address: true,
        user: true,
      },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (order.status !== OrderStatus.Started) {
      throw new BadRequestException("Cannot cancel order");
    }

    order.status = OrderStatus.Cancelled;
    order.cancelled_date = new Date();
    order.cancelled_by = phone;

    await this.orderRepository.save(order);

    const ids = order.order_details.map((detail) => detail.product_id);

    const products = await this.productService.findByIds(ids);

    const result = {
      ...order,
      order_details: order.order_details.map((detail) => {
        const product = products.find((product) => product.id === detail.product_id);
        return {
          ...detail,
          image: product.images[0],
          ...product,
        };
      }),
    };

    return result;
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
      console.log(updateOrderDto);
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
