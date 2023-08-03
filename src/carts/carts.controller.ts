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
import { CreateCartDto } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { CartDetailParam } from "./dto/create-cart.dto";
import { JwtAuthGuard, UserGuard } from "~/auth/guards";
import { User } from "~/auth/decorators";
import { ReqUser } from "~/common/req-user.inter";

@Controller("carts")
@UseGuards(JwtAuthGuard, UserGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @User()
  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartsService.create(createCartDto);
  }

  @User()
  @Get("user/:id")
  findOneByUserId(@Query("user") userId: string) {
    return this.cartsService.findOneByUserId(userId);
  }

  @User()
  @Get()
  findAllByUser(@Req() req: Request) {
    const user = req.user as ReqUser;
    return this.cartsService.findAllByUser(user.username);
  }

  @Get("all")
  findAll() {
    return this.cartsService.findAll();
  }

  @User()
  @Get(":id")
  findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.cartsService.findOne(id);
  }

  @User()
  @Patch(":id")
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartsService.update(id, updateCartDto);
  }

  @User()
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.cartsService.remove(id);
  }
}
