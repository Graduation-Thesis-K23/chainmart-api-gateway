import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Req,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  ParseFilePipe,
} from "@nestjs/common";
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
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtEmployeeAuthGuard } from "~/auth-manager/guards/jwt-employee.guards";
import { ShipperGuard } from "~/auth-shipper/guards/shipper.guard";
import { Shipper } from "~/auth-shipper/decorators/shipper.decorator";
import { JwtShipperAuthGuard } from "~/auth-shipper/guards/jwt-shipper.guards";

@Controller("orders")
export class OrdersController {
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

    return this.ordersService.received(user.username, id);
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @User()
  @Patch(":id/return")
  return(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as ReqUser;

    return this.ordersService.return(user.username, id);
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

  @UseGuards(JwtEmployeeAuthGuard, RolesGuard)
  @Roles(Role.Branch)
  @Get("branch")
  branch(@Req() req: Request) {
    const user = req.user as EmployeePayload;

    console.log(user);

    return [];
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
  startShipmentByEmployee(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as EmployeePayload;

    return this.ordersService.startShipmentByEmployee(user.phone, id);
  }

  // shipper API

  @UseGuards(JwtShipperAuthGuard, ShipperGuard)
  @Shipper()
  @Get("shipper")
  getOrdersByShipper(
    @Query("status") status: OrderStatus,
    @Query("page", new ParseIntPipe()) page: number,
    @Req() req: Request,
  ) {
    const user = req.user as EmployeePayload;

    return this.ordersService.getOrdersByShipper(user.phone, status, page);
  }

  @UseGuards(JwtShipperAuthGuard, ShipperGuard)
  @Shipper()
  @Patch(":id/shipper/started")
  startShipmentByShipper(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as EmployeePayload;

    return this.ordersService.startShipmentByShipper(user.phone, id);
  }

  @UseGuards(JwtShipperAuthGuard, ShipperGuard)
  @Shipper()
  @Patch(":id/shipper/completed")
  completedOrderByShipper(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as EmployeePayload;

    return this.ordersService.completedOrderByShipper(user.phone, id);
  }

  @UseGuards(JwtShipperAuthGuard, ShipperGuard)
  @Shipper()
  @Patch(":id/shipper/cancelled")
  cancelledOrderByShipper(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as EmployeePayload;

    return this.ordersService.cancelledOrderByShipper(user.phone, id);
  }

  /* @Patch(":id")
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.ordersService.remove(id);
  } */
}
