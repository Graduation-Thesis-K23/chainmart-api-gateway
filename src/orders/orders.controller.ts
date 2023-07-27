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
  Req,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
} from "@nestjs/common";
import { Request } from "express";

import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { JwtAuthGuard, UserGuard } from "~/auth/guards";
import { RolesGuard } from "~/auth-manager/guards/role.guard";
import { Roles } from "~/auth-manager/decorators/roles.decorator";
import { OrderStatus, Payment, Role } from "~/shared";
import { User } from "~/auth/decorators";
import { ReqUser } from "~/common/req-user.inter";
import { CommentOrderDto } from "./dto/comment-order.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";

@Controller("orders")
export class OrdersController {
  orders = [
    {
      id: "1",
      create_at: Date.now(),
      address: {
        id: "1",
        name: "Nguyễn Văn A",
        phone: "0123456789",
        street: "123 Đường ABC",
        district: "Quận XYZ",
        city: "TP. HCM",
        ward: "Phường 123",
      },
      status: OrderStatus.Processing,
      payment: Payment.Cash,
      products: [
        {
          id: "1",
          name: "Vỏ gối cotton Thắng Lợi chính hãng ( gối nằm - gối ôm ) [ảnh thất 2]",
          price: 100000,
          sale: 0,
          quantity: 1,
          image: "2ba48c4c",
        },
        {
          id: "2",
          name: "Vỏ gối cotton Thắng Lợi chính hãng ( gối nằm - gối ôm ) [ảnh thất 2] 21",
          price: 1000000,
          sale: 2,
          quantity: 2,
          image: "2ba48c4c",
        },
      ],
    },
    {
      id: "2",
      create_at: Date.now(),
      address: {
        id: "1",
        name: "Nguyễn Văn A",
        phone: "0123456789",
        street: "123 Đường ABC",
        district: "Quận XYZ",
        city: "TP. HCM",
        ward: "Phường 123",
      },
      approved_date: Date.now(),
      status: OrderStatus.Approved,
      payment: Payment.Cash,
      products: [
        {
          id: "1",
          name: "Áo thun nam",
          price: 100000,
          sale: 0,
          quantity: 1,
          image: "2ba48c4c",
        },
        {
          id: "2",
          name: "Áo thun nam 1",
          price: 1000000,
          sale: 2,
          quantity: 2,
          image: "2ba48c4c",
        },
      ],
    },
    {
      id: "3",
      create_at: Date.now(),
      address: {
        id: "1",
        name: "Nguyễn Văn A",
        phone: "0123456789",
        street: "123 Đường ABC",
        district: "Quận XYZ",
        city: "TP. HCM",
        ward: "Phường 123",
      },
      approved_date: Date.now(),
      status: OrderStatus.Shipping,
      payment: Payment.Cash,
      products: [
        {
          id: "1",
          name: "Áo thun nam",
          price: 100000,
          sale: 0,
          quantity: 1,
          image: "2ba48c4c",
        },
        {
          id: "2",
          name: "Áo thun nam 1",
          price: 1000000,
          sale: 2,
          quantity: 2,
          image: "2ba48c4c",
        },
      ],
    },
    {
      id: "4",
      create_at: Date.now(),
      address: {
        id: "1",
        name: "Nguyễn Văn A",
        phone: "0123456789",
        street: "123 Đường ABC",
        district: "Quận XYZ",
        city: "TP. HCM",
        ward: "Phường 123",
      },
      shipped_date: Date.now(),
      approved_date: Date.now(),
      status: OrderStatus.Completed,
      payment: Payment.Cash,
      products: [
        {
          id: "1",
          name: "Áo thun nam",
          price: 100000,
          sale: 0,
          quantity: 1,
          image: "2ba48c4c",
        },
        {
          id: "2",
          name: "Áo thun nam 1",
          price: 1000000,
          sale: 2,
          quantity: 2,
          image: "2ba48c4c",
        },
      ],
    },
    {
      id: "5",
      create_at: Date.now(),
      address: {
        id: "1",
        name: "Nguyễn Văn A",
        phone: "0123456789",
        street: "123 Đường ABC",
        district: "Quận XYZ",
        city: "TP. HCM",
        ward: "Phường 123",
      },
      cancelled_date: Date.now(),
      status: OrderStatus.Cancelled,
      payment: Payment.Cash,
      products: [
        {
          id: "1",
          name: "Áo thun nam",
          price: 100000,
          sale: 0,
          quantity: 1,
          image: "2ba48c4c",
        },
        {
          id: "2",
          name: "Áo thun nam 1",
          price: 1000000,
          sale: 2,
          quantity: 2,
          image: "2ba48c4c",
        },
      ],
    },
    {
      id: "6",
      create_at: Date.now(),
      address: {
        id: "1",
        name: "Nguyễn Văn A",
        phone: "0123456789",
        street: "123 Đường ABC",
        district: "Quận XYZ",
        city: "TP. HCM",
        ward: "Phường 123",
      },
      shipped_date: Date.now(),
      approved_date: Date.now(),
      return_date: Date.now(),
      status: OrderStatus.Returned,
      payment: Payment.Cash,
      products: [
        {
          id: "1",
          name: "Áo thun nam",
          price: 100000,
          sale: 0,
          quantity: 1,
          image: "2ba48c4c",
        },
        {
          id: "2",
          name: "Áo thun nam 1",
          price: 1000000,
          sale: 2,
          quantity: 2,
          image: "2ba48c4c",
        },
      ],
    },
  ];

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const user = req.user as ReqUser;
    console.log("createOrderDto", createOrderDto);
    console.log("user", user);
    return {
      status: "success",
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  findAll(@Query("status") status: OrderStatus | "all", @Req() req: Request) {
    // status = status of orders that we want to get
    const user = req.user as ReqUser;
    console.log(status);
    console.log(user);
    if (status === "all") return this.orders;
    else return this.orders.filter((order) => order.status === status);
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Patch(":id/cancel")
  cancel(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as ReqUser;
    console.log(id);
    console.log(user);
    console.log("cancel order");

    const order = this.orders.find((order) => order.id === id);

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    order.status = OrderStatus.Cancelled;
    order.cancelled_date = Date.now();

    return order;
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Patch(":id/received")
  received(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as ReqUser;
    console.log(id);
    console.log(user);
    console.log("received order");

    const order = this.orders.find((order) => order.id === id);

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    order.status = OrderStatus.Completed;
    order.shipped_date = Date.now();

    return order;
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Patch(":id/return")
  return(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as ReqUser;
    console.log(id);
    console.log(user);
    console.log("return order");

    const order = this.orders.find((order) => order.id === id);

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    order.status = OrderStatus.Returned;
    order.return_date = Date.now();

    return order;
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Post("resell")
  resell(@Body("order_id") order_id: string, @Req() req: Request) {
    const user = req.user as ReqUser;
    console.log(order_id);
    console.log(user);
    console.log("resell order");

    const order = this.orders.find((order) => order.id === order_id);

    // clone order
    const newOrder = { ...order };
    newOrder.id = Math.random().toString();
    newOrder.status = OrderStatus.Processing;
    newOrder.create_at = Date.now();
    newOrder.approved_date = null;
    newOrder.shipped_date = null;
    newOrder.cancelled_date = null;
    newOrder.return_date = null;

    this.orders.push(newOrder);

    return newOrder;
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Post("comment")
  @UseInterceptors(
    FilesInterceptor("images", 10, {
      // dest: "./images",
      limits: { files: 10, fileSize: 1024 * 1000 * 10 },
      fileFilter(_, file, callback) {
        ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)
          ? callback(null, true)
          : callback(new BadRequestException("image/png, image/jpeg, image/webp is accept"), false);
      },
    }),
  )
  comment(
    @Body() commentOrderDto: CommentOrderDto,
    @Req() req: Request,
    @UploadedFiles(new ParseFilePipeBuilder().build())
    images: Express.Multer.File[],
  ) {
    const user = req.user as ReqUser;
    console.log("CommentOrderDto", JSON.parse(commentOrderDto.comments));
    console.log("CommentOrderDto", commentOrderDto.order_id);
    console.log(user);
    console.log(images);

    // const arrBuffer = images.map((image) => image.buffer);
    // save to s3

    return {
      status: "success",
    };
  }

  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Branch)
  @Get("branch")
  branch(@Param("id", new ParseUUIDPipe({ version: "4" })) userId: string) {
    return this.ordersService.findAllByUserId(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.ordersService.remove(id);
  }
}
