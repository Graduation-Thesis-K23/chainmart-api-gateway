import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { firstValueFrom, lastValueFrom, timeout } from "rxjs";
import { instanceToPlain } from "class-transformer";

import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Injectable()
export class OrdersService {
  constructor(
    @Inject("ORDER_SERVICE")
    private readonly orderClient: ClientKafka,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      const $source = this.orderClient.send("orders.create", instanceToPlain(createOrderDto)).pipe(timeout(5000));
      return await firstValueFrom($source);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll() {
    try {
      const $source = this.orderClient.send("orders.findall", {}).pipe(timeout(5000));
      return await lastValueFrom($source);
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
}
