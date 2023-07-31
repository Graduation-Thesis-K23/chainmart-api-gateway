import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
  OnModuleInit,
  Inject,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";

import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { JwtAuthGuard } from "~/auth/guards";
import { RolesGuard } from "~/auth-manager/guards/role.guard";
import { Roles } from "~/auth-manager/decorators/roles.decorator";
import { Role } from "~/shared";

@Controller("orders")
// @UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController implements OnModuleInit {
  constructor(
    private readonly ordersService: OrdersService,

    @Inject("ORDER_SERVICE")
    private readonly orderClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const topics = [
      "create",
      "findall",
      "findallbyuserid",
      "findbyid",
      "update",
      "delete",
      "packaged",
      "cancelled",
      "getnumberordersperday",
      "gethotsellingproduct",
      "getrevenueperday",
    ];
    topics.forEach((topic) => {
      this.orderClient.subscribeToResponseOf(`orders.${topic}`);
    });
    await this.orderClient.connect();
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get("users/:id")
  findAllByUserId(@Param("id", new ParseUUIDPipe({ version: "4" })) userId: string) {
    return this.ordersService.findAllByUserId(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(":id")
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.ordersService.delete(id);
  }
}
