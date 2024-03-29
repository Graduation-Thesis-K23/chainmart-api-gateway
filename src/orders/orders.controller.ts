import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
  OnModuleInit,
  Inject,
  Req,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
  ParseFilePipe,
  ParseIntPipe,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Request } from "express";

import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { JwtAuthGuard, UserGuard } from "~/auth/guards";
import { RolesGuard } from "~/auth-manager/guards/role.guard";
import { Roles } from "~/auth-manager/decorators/roles.decorator";
import { EmployeePayload, OrderStatus, Role } from "~/shared";
import { User } from "~/auth/decorators";
import { ReqUser } from "~/common/req-user.inter";
import { CommentOrderDto } from "./dto/comment-order.dto";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";
import { JwtShipperAuthGuard } from "~/auth-shipper/guards/jwt-shipper.guards";
import { Shipper } from "~/auth-shipper/decorators/shipper.decorator";
import { ShipperGuard } from "~/auth-shipper/guards/shipper.guard";
import { lastValueFrom, timeout } from "rxjs";

@Controller("orders")
export class OrdersController implements OnModuleInit {
  constructor(
    private readonly ordersService: OrdersService,

    @Inject("ORDER_SERVICE")
    private readonly orderClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const orderTopics = [
      "create",
      "findall",
      "findallbyuserid",
      "findbyid",
      "update",
      "delete",
      "cancel",
      "return",
      "resell",
      "markasreceived",
      "findallbyemployee",
      "approveorderbyemployee",
      "rejectorderbyemployee",
      "startshipmentbyemployee",
      "getordersbyshipper",
      "startshipmentbyshipper",
      "completeorderbyshipper",
      "cancellorderbyshipper",
      "packaged",
      "cancelled",
      "findbankingorderbyid",
      "getnumberordersperday",
      "gethotsellingproduct",
      "getrevenueperday",
      "commented",
      "getordersbyphone",
      "findallbyids",
      "findallbyadmin",
      "health-check",
    ];
    orderTopics.forEach((topic) => {
      this.orderClient.subscribeToResponseOf(`orders.${topic}`);
    });
    await this.orderClient.connect();
  }

  @Get("health-check")
  async healthCheck() {
    try {
      const $result = this.orderClient.send("orders.health-check", {}).pipe(timeout(5000));

      return await lastValueFrom($result);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    try {
      const user = req.user as ReqUser;
      return this.ordersService.create(user.username, createOrderDto);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  findAll(@Query("status") status: OrderStatus | "all", @Req() req: Request) {
    // status = status of orders that we want to get
    try {
      const user = req.user as ReqUser;
      return this.ordersService.findAll(user.username, status);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Patch(":id/cancel")
  cancel(@Param("id") id: string, @Req() req: Request) {
    try {
      const user = req.user as ReqUser;
      return this.ordersService.cancelOrder(user.username, id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Patch(":id/received")
  markAsReceived(@Param("id") id: string, @Req() req: Request) {
    try {
      const user = req.user as ReqUser;
      return this.ordersService.markAsReceived(user.username, id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Patch(":id/return")
  return(@Param("id") id: string, @Req() req: Request) {
    try {
      const user = req.user as ReqUser;
      return this.ordersService.returnOrder(user.username, id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Post("resell")
  resell(@Body("order_id") order_id: string, @Req() req: Request) {
    try {
      const user = req.user as ReqUser;
      return this.ordersService.resellOrder(user.username, order_id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
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
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    images: Express.Multer.File[],
  ) {
    try {
      const user = req.user as ReqUser;

      if (images.length > 0) {
        const arrBuffer = images.map((image) => image.buffer);

        return this.ordersService.comment(user.username, commentOrderDto, arrBuffer);
      }

      return this.ordersService.comment(user.username, commentOrderDto, []);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  @Get("admin")
  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  getAllOrdersByAdmin(@Query("status") status: OrderStatus | "all", @Query("search") search: string) {
    // status = status of orders that we want to get
    try {
      return this.ordersService.getAllOrdersByAdmin(status, search);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  // EMPLOYEE
  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Branch)
  @Get("branch")
  branch(@Req() req: Request, @Query("status") status: OrderStatus | "all", @Query("search") search: string) {
    try {
      const user = req.user as EmployeePayload;
      return this.ordersService.findAllByBranch(user.phone, status, search);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Get("employee")
  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Employee)
  getOrdersByEmployee(
    @Req() req: Request,
    @Query("status") status: OrderStatus | "all",
    @Query("search") search: string,
  ) {
    try {
      const user = req.user as EmployeePayload;
      return this.ordersService.findAllByEmployee(user.phone, status, search);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Employee, Role.Branch)
  @Patch(":id/approve")
  approve(@Param("id") id: string, @Req() req: Request) {
    try {
      const user = req.user as EmployeePayload;
      return this.ordersService.approveOrderByEmployee(user.phone, id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Employee, Role.Branch)
  @Patch(":id/reject")
  reject(@Param("id") id: string, @Req() req: Request) {
    try {
      const user = req.user as EmployeePayload;
      return this.ordersService.rejectOrderByEmployee(user.phone, id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Employee, Role.Branch)
  @Patch(":id/begin-ship")
  startShipmentByEmployee(@Param("id") id: string, @Req() req: Request) {
    try {
      const user = req.user as EmployeePayload;
      return this.ordersService.startShipmentByEmployee(user.phone, id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  // SHIPPER
  @UseGuards(JwtShipperAuthGuard, ShipperGuard)
  @Shipper()
  @Get("shipper")
  getOrdersByShipper(
    @Query("status") status: OrderStatus,
    @Query("page", new ParseIntPipe()) page: number,
    @Req() req: Request,
  ) {
    try {
      const user = req.user as EmployeePayload;
      return this.ordersService.getOrdersByShipper(user.phone, status, page);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtShipperAuthGuard, ShipperGuard)
  @Shipper()
  @Patch(":id/shipper/started")
  startShipmentByShipper(@Param("id") id: string, @Req() req: Request) {
    try {
      const user = req.user as EmployeePayload;
      return this.ordersService.startShipmentByShipper(user.phone, id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtShipperAuthGuard, ShipperGuard)
  @Shipper()
  @Patch(":id/shipper/completed")
  completeOrderByShipper(@Param("id") id: string, @Req() req: Request) {
    try {
      const user = req.user as EmployeePayload;
      return this.ordersService.completeOrderByShipper(user.phone, id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtShipperAuthGuard, ShipperGuard)
  @Shipper()
  @Patch(":id/shipper/cancelled")
  cancelOrderByShipper(@Param("id") id: string, @Req() req: Request) {
    try {
      const user = req.user as EmployeePayload;
      return this.ordersService.cancelOrderByShipper(user.phone, id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtAuthGuard, UseGuards)
  @User()
  @Get("users/:id")
  findAllByUserId(@Param("id", new ParseUUIDPipe({ version: "4" })) userId: string) {
    try {
      return this.ordersService.findAllByUserId(userId);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Get("banking")
  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  findBankingOrderById(@Query("order_id") order_id: string) {
    try {
      return this.ordersService.findBankingOrderById(order_id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Post("banking/cancel")
  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  cancelBankingOrder(@Body() cancelDto: { order_id: string }) {
    try {
      return this.ordersService.cancelBankingOrderById(cancelDto.order_id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Post("payment")
  makePayment(@Body() paymentDto: { order_id: string }) {
    try {
      return this.ordersService.makePayment(paymentDto.order_id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @UseGuards(JwtShipperAuthGuard, ShipperGuard)
  @Shipper()
  @Get(":id")
  findOne(@Param("id") id: string) {
    try {
      return this.ordersService.findById(id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  @Get("search/:phone")
  getOrdersByPhone(@Param("phone") phone: string) {
    try {
      return this.ordersService.getOrdersByPhone(phone);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  /*   @Patch(":id")
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }
 */

  /* @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.ordersService.delete(id);
  } */
}
