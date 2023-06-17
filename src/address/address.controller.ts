import { Body, Controller, Req, Post, UseGuards, Get, Delete, ParseUUIDPipe, Param } from "@nestjs/common";
import { Request } from "express";

import { CreateAddressDto } from "./dto/create-address.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { AddressService } from "./address.service";
import { Roles } from "../auth-manager/decorators/roles.decorator";
import { Role } from "src/shared";
import { ReqUser } from "src/common/req-user.inter";
import { UserGuard } from "src/auth/guards";
import { User } from "src/auth/decorators";

@Controller("address")
@UseGuards(JwtAuthGuard, UserGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @User()
  async create(@Body() createAddressDto: CreateAddressDto, @Req() req: Request) {
    const user = req.user as ReqUser;

    return await this.addressService.create(user.username, createAddressDto);
  }

  @Get()
  @User()
  @Roles(Role.Employee)
  async getAll(@Req() req: Request) {
    const user = req.user as ReqUser;

    return await this.addressService.getAll(user.username);
  }

  @Delete(":id")
  @User()
  async delete(@Req() req: Request, @Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    const user = req.user as ReqUser;

    return await this.addressService.delete(user.username, id);
  }
}
