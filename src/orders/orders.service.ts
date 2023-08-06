import { EmployeeService } from "../employee/employee.service";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { firstValueFrom, lastValueFrom, timeout } from "rxjs";
import { instanceToPlain } from "class-transformer";
import { Repository } from "typeorm";

import { CreateOrderDto } from "./dto/create-order.dto";
import { CommentOrderDto } from "./dto/comment-order.dto";
import { OrderStatus } from "~/shared";
import { User } from "~/users/entities/user.entity";
import { S3Service } from "~/s3/s3.service";

@Injectable()
export class OrdersService {
  constructor(
    @Inject("ORDER_SERVICE")
    private readonly orderClient: ClientKafka,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly employeeService: EmployeeService,

    private readonly s3Service: S3Service,
  ) {}

  async create(username: string, createOrderDto: CreateOrderDto) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    try {
      const $source = this.orderClient
        .send(
          "orders.create",
          instanceToPlain({
            user_id: user.id,
            ...createOrderDto,
            username,
          }),
        )
        .pipe(timeout(5000));
      return await firstValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(username: string, status: OrderStatus | "all") {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    try {
      const $orderSource = this.orderClient
        .send("orders.findall", {
          user_id: user.id,
          status,
        })
        .pipe(timeout(5000));
      return await lastValueFrom($orderSource);
      /* 
      const ids = orders.map((order) => order.order_details.map((detail) => detail.product_id)).flat();

      const $productSource = this.productClient.send("products.findbyids", ids).pipe(timeout(5000));
      const products = await lastValueFrom($productSource);

      const result = orders.map((order) => {
        const order_details = order.order_details.map((detail) => {
          const product = products.find((product) => product.id === detail.product_id);
          return {
            ...detail,
            image: product?.images[0] ?? [],
            ...product,
          };
        });
        return {
          ...order,
          order_details,
        };
      });

      return result; */
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAllByUserId(userId: string) {
    try {
      const $source = this.orderClient.send("orders.findallbyuserid", userId).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Cannot find orders by user_id");
    }
  }

  async findById(id: string) {
    try {
      const $source = this.orderClient.send("orders.findbyid", id).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  /* async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      return `This action updates a #${id} order`;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot update order with id(${id})`);
    }
  } */

  async delete(id: string) {
    try {
      const $source = this.orderClient.send("orders.delete", id).pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async comment(username: string, commentOrderDto: CommentOrderDto, arrBuffer: Buffer[]) {
    try {
      const user = await this.userRepository.findOneBy({ username });
      if (!user) {
        throw new BadRequestException("User not found");
      }

      let images = [];
      if (arrBuffer.length !== 0) {
        images = await this.s3Service.uploadImagesToS3(arrBuffer);
      }

      return await lastValueFrom(
        this.orderClient
          .send(
            "orders.commented",
            instanceToPlain({
              ...commentOrderDto,
              username,
              images,
            }),
          )
          .pipe(timeout(5000)),
      );
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to comment order");
    }
  }

  async cancelOrder(username: string, orderId: string) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    try {
      const $source = this.orderClient
        .send("orders.cancel", {
          user_id: user.id,
          order_id: orderId,
        })
        .pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to cancel order");
    }
  }

  async returnOrder(username: string, orderId: string) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    try {
      const $source = this.orderClient
        .send("orders.return", {
          user_id: user.id,
          order_id: orderId,
        })
        .pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to return order");
    }
  }

  async resellOrder(username: string, orderId: string) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    try {
      const $source = this.orderClient
        .send("orders.resell", {
          user_id: user.id,
          order_id: orderId,
        })
        .pipe(timeout(5000));
      const order = await lastValueFrom($source);

      // TODO: rewrite this

      return order;
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to return order");
    }
  }

  async markAsReceived(username: string, orderId: string) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    try {
      const $orderSource = this.orderClient
        .send("orders.markasreceived", {
          user_id: user.id,
          order_id: orderId,
        })
        .pipe(timeout(5000));
      return await lastValueFrom($orderSource);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to mark as receive order");
    }
  }

  async findAllByEmployee(phone: string, status: OrderStatus | "all", search: string) {
    const { id: branch_id } = await this.employeeService.findBranchByPhone(phone);

    try {
      const $orderSource = this.orderClient
        .send("orders.findallbyemployee", {
          phone,
          status,
          branch_id,
        })
        .pipe(timeout(5000));
      let orders = await lastValueFrom($orderSource);

      if (search) {
        /* orders = await Promise.all(
          orders.map(async (order) => ({
            ...order,
            address: await this.addressService.findById(order.address_id),
          })),
        );
 */
        orders = orders.filter((order) => {
          return (
            order.address.name.toLowerCase().includes(search.toLowerCase()) ||
            order.address.phone.toLowerCase().includes(search.toLowerCase())
          );
        });
      }

      return orders;

      /* const ids = orders.map((order) => order.order_details.map((detail) => detail.product_id)).flat();

      const $productSource = this.productClient.send("products.findbyids", ids).pipe(timeout(5000));
      const products = await lastValueFrom($productSource);

      const result = orders.map((order) => {
        const order_details = order.order_details.map((detail) => {
          const product = products.find((product) => product.id === detail.product_id);
          return {
            ...detail,
            image: product?.images[0] ?? [],
            ...product,
          };
        });
        return {
          ...order,
          order_details,
        };
      });

      return result; */
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to find all order by employee");
    }
  }

  async approveOrderByEmployee(phone: string, orderId: string) {
    const { id: branch_id } = await this.employeeService.findBranchByPhone(phone);

    console.log(phone, orderId);
    try {
      const $source = this.orderClient
        .send("orders.approveorderbyemployee", {
          phone,
          order_id: orderId,
          branch_id,
        })
        .pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to approve order by employee");
    }
  }

  async rejectOrderByEmployee(phone: string, orderId: string) {
    const { id: branch_id } = await this.employeeService.findBranchByPhone(phone);

    try {
      const $source = this.orderClient
        .send("orders.rejectorderbyemployee", {
          phone,
          order_id: orderId,
          branch_id,
        })
        .pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to reject order by employee");
    }
  }

  async startShipmentByEmployee(phone: string, orderId: string) {
    try {
      const $source = this.orderClient
        .send("orders.startshipmentbyemployee", {
          phone,
          order_id: orderId,
        })
        .pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to start shipment by employee");
    }
  }

  async getOrdersByShipper(phone: string, status: OrderStatus, page: number) {
    const { id: branch_id } = await this.employeeService.findBranchByPhone(phone);

    try {
      const $orderSource = this.orderClient
        .send("orders.getordersbyshipper", {
          phone,
          status,
          page,
          branch_id,
        })
        .pipe(timeout(5000));
      return await lastValueFrom($orderSource);

      /*  const ids = orders.map((order) => order.order_details.map((detail) => detail.product_id)).flat();

      const $productSource = this.productClient.send("products.findbyids", ids).pipe(timeout(5000));
      const products = await lastValueFrom($productSource);

      const result = orders.map((order) => {
        const order_details = order.order_details.map((detail) => {
          const product = products.find((product) => product.id === detail.product_id);
          return {
            ...detail,
            image: product?.images[0] ?? [],
            ...product,
          };
        });
        return {
          ...order,
          order_details,
        };
      });

      return result; */
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to get order by shipper");
    }
  }

  async startShipmentByShipper(phone: string, orderId: string) {
    try {
      const $orderSource = this.orderClient
        .send("orders.startshipmentbyshipper", {
          phone,
          order_id: orderId,
        })
        .pipe(timeout(5000));
      return await lastValueFrom($orderSource);

      /*  const ids = order.order_details.map((detail) => detail.product_id);

      const $productSource = this.productClient.send("products.findbyids", ids).pipe(timeout(5000));
      const products = await lastValueFrom($productSource);

      const result = {
        ...order,
        order_details: order.order_details.map((detail) => {
          const product = products.find((product) => product.id === detail.product_id);
          return {
            ...detail,
            image: product?.images[0] ?? [],
            ...product,
          };
        }),
      };

      return result; */
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to start shipment by shipper");
    }
  }

  async completeOrderByShipper(phone: string, orderId: string) {
    try {
      const $orderSource = this.orderClient
        .send("orders.completeorderbyshipper", {
          phone,
          order_id: orderId,
        })
        .pipe(timeout(5000));
      return await lastValueFrom($orderSource);

      /*  const ids = order.order_details.map((detail) => detail.product_id);

      const $productSource = this.productClient.send("products.findbyids", ids).pipe(timeout(5000));
      const products = await lastValueFrom($productSource);

      const result = {
        ...order,
        order_details: order.order_details.map((detail) => {
          const product = products.find((product) => product.id === detail.product_id);
          return {
            ...detail,
            image: product?.images[0] ?? [],
            ...product,
          };
        }),
      };

      return result; */
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to complete order by shipper");
    }
  }

  async cancelOrderByShipper(phone: string, orderId: string) {
    try {
      const $orderSource = this.orderClient
        .send("orders.cancellorderbyshipper", {
          phone,
          order_id: orderId,
        })
        .pipe(timeout(5000));
      return await lastValueFrom($orderSource);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to cancell order by shipper");
    }
  }

  // dashboard
  async getHotSellingProduct(startDate: string, endDate: string, branch: string) {
    try {
      const $source = this.orderClient
        .send("orders.gethotsellingproduct", { startDate, endDate, branch })
        .pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async getNumberOrdersPerDay(startDate: string, endDate: string, branch: string) {
    try {
      const $source = this.orderClient
        .send("orders.getnumberordersperday", { startDate, endDate, branch })
        .pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async getRevenuePerDay(startDate: string, endDate: string, branch: string) {
    try {
      const $source = this.orderClient
        .send("orders.getrevenueperday", { startDate, endDate, branch })
        .pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }
}
