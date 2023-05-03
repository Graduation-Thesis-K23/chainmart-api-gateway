import { AddressService } from "./address.service";
import { Body, Controller, Req, Post, UseGuards, Get } from "@nestjs/common";
import { Request } from "express";

import { CreateAddressDto } from "./dto/create-address.dto";
import { ReqUser } from "src/common/req-user.inter";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "src/auth/guards/role.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/users/enums/role.enum";

@Controller("address")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @Roles(Role.User)
  async create(@Body() createAddressDto: CreateAddressDto, @Req() req: Request) {
    const user = req.user as ReqUser;

    return await this.addressService.create(user.username, createAddressDto);
  }

  @Get()
  @Roles(Role.User)
  async getAll(@Req() req: Request) {
    const user = req.user as ReqUser;

    return await this.addressService.getAll(user.username);
  }
}
