import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from "@nestjs/common";
import { Request } from "express";

import { CartsService } from "./carts.service";
import { CartDetailParam, CreateCartDto } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { JwtAuthGuard, UserGuard } from "~/auth/guards";
import { ReqUser } from "~/common/req-user.inter";
import { User } from "~/auth/decorators";

@Controller("carts")
@UseGuards(JwtAuthGuard, UserGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @User()
  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as ReqUser;
    return this.cartsService.findAll(user.username);
  }

  @User()
  @Post()
  create(@Body() createCartDto: CartDetailParam, @Req() req: Request) {
    const user = req.user as ReqUser;
    return this.cartsService.create(user.username, createCartDto);
  }

  @User()
  @Patch(":id")
  updateCart(@Body("action") action: string, @Req() req: Request, @Param("id") id: string) {
    const user = req.user as ReqUser;
    return this.cartsService.updateCart(user.username, action, id);
  }

  @User()
  @Delete(":id")
  removeCart(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Req() req: Request) {
    const user = req.user as ReqUser;
    return this.cartsService.removeCart(user.username, id);
  }

  @Get("user/:id")
  findOneByUserId(@Query("user") userId: string) {
    return this.cartsService.findOneByUserId(userId);
  }

  @Get(":id")
  findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.cartsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartsService.update(id, updateCartDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.cartsService.remove(id);
  }
}
