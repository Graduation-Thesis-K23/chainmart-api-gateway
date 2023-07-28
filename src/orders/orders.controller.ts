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
  ParseIntPipe,
} from "@nestjs/common";
import { Request } from "express";

import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { JwtAuthGuard, UserGuard } from "~/auth/guards";
import { RolesGuard } from "~/auth-manager/guards/role.guard";
import { Roles } from "~/auth-manager/decorators/roles.decorator";
import { EmployeePayload, OrderStatus, Payment, Role } from "~/shared";
import { User } from "~/auth/decorators";
import { ReqUser } from "~/common/req-user.inter";
import { CommentOrderDto } from "./dto/comment-order.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";
import { ShipperGuard } from "~/auth-shipper/guards/shipper.guard";
import { Shipper } from "~/auth-shipper/decorators/shipper.decorator";
import { JwtShipperAuthGuard } from "~/auth-shipper/guards/jwt-shipper.guards";

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
      status: OrderStatus.Created,
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
      status: OrderStatus.Created,
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
      shipping_date: Date.now(),
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

    return this.ordersService.create(user.username, createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  findAll(@Query("status") status: OrderStatus | "all", @Req() req: Request) {
    // status = status of orders that we want to get
    const user = req.user as ReqUser;

    return this.ordersService.findAll(user.username, status);
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Patch(":id/cancel")
  cancel(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as ReqUser;

    return this.ordersService.cancelOrder(user.username, id);
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

    return this.ordersService.resell(user.username, order_id);
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
  branch(@Req() req: Request) {
    const user = req.user as EmployeePayload;

    console.log(user);

    return [
      {
        id: "1",
        created_at: Date.now().toLocaleString(),
        status: OrderStatus.Created,
        payment: Payment.Cash,
        name: "Nguyễn Văn A",
        phone: "0123456789",
        total: 100000,
      },
      {
        id: "2",
        created_at: Date.now().toLocaleString(),
        status: OrderStatus.Created,
        payment: Payment.Cash,
        name: "Nguyễn Văn B",
        phone: "01234567839",
        total: 120000,
      },
      {
        id: "3",
        created_at: Date.now().toLocaleString(),
        status: OrderStatus.Created,
        payment: Payment.Cash,
        name: "Nguyễn Văn C",
        phone: "01234526789",
        total: 110000,
      },
    ];
  }

  @Get("employee")
  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Employee)
  getOrdersByEmployee(
    @Req() req: Request,
    @Query("status") status: OrderStatus | "all",
    @Query("search") search: string,
  ) {
    const user = req.user as EmployeePayload;

    return this.ordersService.getOrdersByEmployee(user.phone, status, search);
  }

  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Employee)
  @Patch(":id/approve")
  approve(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as EmployeePayload;

    return this.ordersService.approveOrderByEmployee(user.phone, id);
  }

  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Employee)
  @Patch(":id/reject")
  reject(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as EmployeePayload;

    return this.ordersService.rejectOrderByEmployee(user.phone, id);
  }

  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Employee)
  @Patch(":id/begin-ship")
  beginShip(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as EmployeePayload;
    console.log(user);
    console.log(id);

    const order = this.orders.find((order) => order.id === id);

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    order.status = OrderStatus.Started;
    order.shipping_date = Date.now();

    return order;
  }

  @UseGuards(JwtShipperAuthGuard, ShipperGuard)
  @Shipper()
  @Get("shipper")
  finishShip(
    @Query("status") status: OrderStatus,
    @Query("page", new ParseIntPipe()) page: number,
    @Req() req: Request,
  ) {
    const user = req.user as EmployeePayload;
    console.log("status", status);
    console.log("page", page);
    console.log("user", user);

    // view user host
    console.log("host", req.headers.host);

    return [
      {
        id: "1",
        address: {
          id: "1",
          name: "Nguyễn Văn A",
          phone: "0123456789",
          street: "123 Đường ABC",
          district: "Quận XYZ",
          city: "TP. HCM",
          ward: "Phường 123",
        },
        packaged_date: Date.now(),
        approved_date: Date.now() - 1000000,
        started_date: Date.now() - 1000000,
        completed_date: Date.now() - 1000000,
        cancelled_date: Date.now() - 1000000,
        status,
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
        address: {
          id: "1",
          name: "Nguyễn Văn A",
          phone: "0123456789",
          street: "123 Đường ABC",
          district: "Quận XYZ",
          city: "TP. HCM",
          ward: "Phường 123",
        },
        packaged_date: Date.now(),
        approved_date: Date.now() - 1000000,
        started_date: Date.now() - 1000000,
        completed_date: Date.now() - 1000000,
        cancelled_date: Date.now() - 1000000,
        status,
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
        address: {
          id: "1",
          name: "Nguyễn Văn A",
          phone: "0123456789",
          street: "123 Đường ABC",
          district: "Quận XYZ",
          city: "TP. HCM",
          ward: "Phường 123",
        },
        packaged_date: Date.now(),
        approved_date: Date.now() - 1000000,
        started_date: Date.now() - 1000000,
        completed_date: Date.now() - 1000000,
        cancelled_date: Date.now() - 1000000,
        status,
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
        address: {
          id: "1",
          name: "Nguyễn Văn A",
          phone: "0123456789",
          street: "123 Đường ABC",
          district: "Quận XYZ",
          city: "TP. HCM",
          ward: "Phường 123",
        },
        packaged_date: Date.now(),
        approved_date: Date.now() - 1000000,
        started_date: Date.now() - 1000000,
        completed_date: Date.now() - 1000000,
        cancelled_date: Date.now() - 1000000,
        status,
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
        address: {
          id: "1",
          name: "Nguyễn Văn A",
          phone: "0123456789",
          street: "123 Đường ABC",
          district: "Quận XYZ",
          city: "TP. HCM",
          ward: "Phường 123",
        },
        packaged_date: Date.now(),
        approved_date: Date.now() - 1000000,
        started_date: Date.now() - 1000000,
        completed_date: Date.now() - 1000000,
        cancelled_date: Date.now() - 1000000,
        status,
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
        address: {
          id: "1",
          name: "Nguyễn Văn A",
          phone: "0123456789",
          street: "123 Đường ABC",
          district: "Quận XYZ",
          city: "TP. HCM",
          ward: "Phường 123",
        },
        packaged_date: Date.now(),
        approved_date: Date.now() - 1000000,
        started_date: Date.now() - 1000000,
        completed_date: Date.now() - 1000000,
        cancelled_date: Date.now() - 1000000,
        status,
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
