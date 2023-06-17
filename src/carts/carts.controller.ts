import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";

import { CartsService } from "./carts.service";
import { CreateCartDto } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { Roles } from "../auth-manager/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "../auth-manager/guards/role.guard";
import { Role } from "src/shared";

@Controller("carts")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @Roles(Role.Employee)
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartsService.create(createCartDto);
  }

  @Get("user/:id")
  @Roles(Role.Employee)
  findOneByUserId(@Query("user") userId: string) {
    return this.cartsService.findOneByUserId(userId);
  }

  @Get()
  @Roles(Role.Employee)
  findAll() {
    return this.cartsService.findAll();
  }

  @Get(":id")
  @Roles(Role.Employee)
  findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.cartsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartsService.update(id, updateCartDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Employee, Role.Employee)
  remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.cartsService.remove(id);
  }
}
