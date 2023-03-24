import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { SuppliersService } from "./suppliers.service";

@Controller("suppliers")
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
  async delete(@Param("id") id: string) {
    return this.suppliersService.delete(id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.update(id, updateSupplierDto);
  }
}
