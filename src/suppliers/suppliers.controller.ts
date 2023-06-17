import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";

import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { SuppliersService } from "./suppliers.service";
import { RolesGuard } from "../auth-manager/guards/role.guard";
import { Roles } from "../auth-manager/decorators/roles.decorator";
import { Role } from "src/shared";
import { JwtEmployeeAuthGuard } from "src/auth-manager/guards/jwt-employee.guards";

@Controller("suppliers")
@UseGuards(JwtEmployeeAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  async getAll() {
    return this.suppliersService.getAll();
  }

  @Post()
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Delete(":id")
  async delete(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.suppliersService.delete(id);
  }

  @Patch(":id")
  async update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }
}
