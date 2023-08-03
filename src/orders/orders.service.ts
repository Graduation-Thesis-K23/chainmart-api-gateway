import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { firstValueFrom, lastValueFrom, timeout } from "rxjs";
import { instanceToPlain } from "class-transformer";
import { Repository } from "typeorm";

import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { CommentOrderDto } from "./dto/comment-order.dto";
import { OrderStatus } from "~/shared";
import { User } from "~/users/entities/user.entity";
import { S3Service } from "~/s3/s3.service";
import { CommentsService } from "~/comments/comments.service";
import { AddressService } from "~/address/address.service";

@Injectable()
export class OrdersService {
  constructor(
    @Inject("ORDER_SERVICE")
    private readonly orderClient: ClientKafka,

    @Inject("PRODUCT_SERVICE")
    private readonly productClient: ClientKafka,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly s3Service: S3Service,
    private readonly commentsService: CommentsService,
    private readonly addressService: AddressService,
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
      const orders = await lastValueFrom($orderSource);

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

      return result;
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

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      return `This action updates a #${id} order`;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(`Cannot update order with id(${id})`);
    }
  }

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
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    let images = [];
    if (arrBuffer.length !== 0) {
      images = await this.s3Service.uploadImagesToS3(arrBuffer);
    }

    this.orderClient.send(
      "orders.commented",
      instanceToPlain({
        user_id: user.id,
        ...commentOrderDto,
      }),
    );

    await this.commentsService.create({
      ...commentOrderDto,
      user_id: user.id,
      images,
    });

    return {
      status: "success",
    };
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
      const order = await lastValueFrom($orderSource);

      const ids = order.order_details.map((detail) => detail.product_id);

      const $productSource = this.productClient.send("products.findbyids", ids).pipe(timeout(5000));
      const products = await lastValueFrom($productSource);

      const newOrderDetails = order.order_details.map((detail) => {
        const product = products.find((product) => product.id === detail.product_id);
        return {
          ...detail,
          image: product?.images[0] ?? [],
          ...product,
        };
      });

      return {
        ...order,
        order_details: newOrderDetails,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to mark as receive order");
    }
  }

  async findAllByEmployee(phone: string, status: OrderStatus | "all", search: string) {
    try {
      const $orderSource = this.orderClient
        .send("orders.findallbyemployee", {
          phone,
          status,
        })
        .pipe(timeout(5000));
      let orders = await lastValueFrom($orderSource);

      if (search) {
        orders = await Promise.all(
          orders.map(async (order) => ({
            ...order,
            address: await this.addressService.findById(order.address_id),
          })),
        );

        orders = orders.filter((order) => {
          return (
            order.address.name.toLowerCase().includes(search.toLowerCase()) ||
            order.address.phone.toLowerCase().includes(search.toLowerCase())
          );
        });
      }

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

      return result;
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to find all order by employee");
    }
  }

  async approveOrderByEmployee(phone: string, orderId: string) {
    try {
      const $source = this.orderClient
        .send("orders.approveOrderByEmployee", {
          phone,
          order_id: orderId,
        })
        .pipe(timeout(5000));
      return await lastValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to approve order by employee");
    }
  }

  async rejectOrderByEmployee(phone: string, orderId: string) {
    try {
      const $source = this.orderClient
        .send("orders.rejectorderbyemployee", {
          phone,
          order_id: orderId,
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
    try {
      const $orderSource = this.orderClient
        .send("orders.getorderbyshipper", {
          phone,
          status,
          page,
        })
        .pipe(timeout(5000));
      const orders = await lastValueFrom($orderSource);

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

      return result;
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
      const order = await lastValueFrom($orderSource);

      const ids = order.order_details.map((detail) => detail.product_id);

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

      return result;
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to start shipment by shipper");
    }
  }

  async completeOrderByShipper(phone: string, orderId: string) {
    try {
      const $orderSource = this.orderClient
        .send("orders.completeOrderByShipper", {
          phone,
          order_id: orderId,
        })
        .pipe(timeout(5000));
      const order = await lastValueFrom($orderSource);

      const ids = order.order_details.map((detail) => detail.product_id);

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

      return result;
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
      const order = await lastValueFrom($orderSource);

      const ids = order.order_details.map((detail) => detail.product_id);

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

      return result;
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Failed to cancell order by shipper");
    }
  }
}
