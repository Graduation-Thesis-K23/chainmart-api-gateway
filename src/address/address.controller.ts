import { AddressService } from "./address.service";
import { Body, Controller, Req, Post, UseGuards, Get, Delete, ParseUUIDPipe, Param } from "@nestjs/common";
import { Request } from "express";

import { CreateAddressDto } from "./dto/create-address.dto";
import { ReqUser } from "src/common/req-user.inter";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "../auth-manager/guards/role.guard";
import { Roles } from "../auth-manager/decorators/roles.decorator";
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

  @Delete(":id")
  @Roles(Role.User)
  async delete(@Req() req: Request, @Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    const user = req.user as ReqUser;

    return await this.addressService.delete(user.username, id);
  }
}
