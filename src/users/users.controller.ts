import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from "@nestjs/common";

import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Role } from "./enums/role.enum";
import { RolesGuard } from "../auth/guards/role.guard";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(":id")
  async update(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  async remove(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return await this.usersService.remove(id);
  }
}
